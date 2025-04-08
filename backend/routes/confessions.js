const express = require('express');
const router = express.Router();
const db = require('../models/database');

// Ensure the confessions table exists
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS confessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      message TEXT NOT NULL,
      author TEXT DEFAULT 'Anonymous',
      recipient TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

// Get all confessions
router.get('/', (req, res) => {
  db.all('SELECT * FROM confessions ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      console.error('Error fetching confessions:', err);
      return res.status(500).json({ error: err.message });
    }
    // Return empty array if no rows found
    res.json(rows || []);
  });
});

// Get a single confession
router.get('/:id', (req, res) => {
  db.get('SELECT * FROM confessions WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ message: 'Confession not found' });
    }
    res.json(row);
  });
});

// Create a new confession
router.post('/', (req, res) => {
  try {
    const { message, author, recipient } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const params = [
      message,
      author || 'Anonymous',
      recipient || null
    ];

    db.run(
      'INSERT INTO confessions (message, author, recipient) VALUES (?, ?, ?)',
      params,
      function(err) {
        if (err) {
          console.error('Error creating confession:', err);
          return res.status(400).json({ error: err.message });
        }

        // Create a timestamp in ISO format
        const now = new Date().toISOString();

        res.status(201).json({
          id: this.lastID,
          message,
          author: author || 'Anonymous',
          recipient: recipient || null,
          created_at: now
        });
      }
    );
  } catch (error) {
    console.error('Unexpected error in confession creation:', error);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
});

// Delete a confession
router.delete('/:id', (req, res) => {
  db.run('DELETE FROM confessions WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Confession not found' });
    }
    res.json({ message: 'Confession deleted successfully' });
  });
});

module.exports = router;
