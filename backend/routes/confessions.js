const express = require('express');
const router = express.Router();
const db = require('../models/database');

// Ensure the confessions table exists
try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS confessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      message TEXT NOT NULL,
      author TEXT DEFAULT 'Anonymous',
      recipient TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
} catch (err) {
  console.error('Error creating confessions table:', err.message);
}

// Get all confessions
router.get('/', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM confessions ORDER BY created_at DESC').all();
    // Return empty array if no rows found
    res.json(rows || []);
  } catch (err) {
    console.error('Error fetching confessions:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Get a single confession
router.get('/:id', (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM confessions WHERE id = ?').get(req.params.id);
    if (!row) {
      return res.status(404).json({ message: 'Confession not found' });
    }
    res.json(row);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Create a new confession
router.post('/', (req, res) => {
  try {
    const { message, author, recipient } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const authorValue = author || 'Anonymous';
    const recipientValue = recipient || null;

    const insertStmt = db.prepare(
      'INSERT INTO confessions (message, author, recipient) VALUES (?, ?, ?)'
    );

    const result = insertStmt.run(message, authorValue, recipientValue);

    // Create a timestamp in ISO format
    const now = new Date().toISOString();

    res.status(201).json({
      id: result.lastInsertRowid,
      message,
      author: authorValue,
      recipient: recipientValue,
      created_at: now
    });
  } catch (error) {
    console.error('Error creating confession:', error);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
});

// Delete a confession
router.delete('/:id', (req, res) => {
  try {
    const deleteStmt = db.prepare('DELETE FROM confessions WHERE id = ?');
    const result = deleteStmt.run(req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({ message: 'Confession not found' });
    }

    res.json({ message: 'Confession deleted successfully' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
