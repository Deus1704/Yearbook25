const express = require('express');
const router = express.Router();
const db = require('../models/database');

// Table is created in database.js initialization

// Get all confessions
router.get('/', async (req, res) => {
  try {
    const rows = db.all('SELECT * FROM confessions ORDER BY created_at DESC');
    // Return empty array if no rows found
    res.json(rows || []);
  } catch (err) {
    console.error('Error fetching confessions:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Get a single confession
router.get('/:id', async (req, res) => {
  try {
    const row = db.get('SELECT * FROM confessions WHERE id = ?', [req.params.id]);
    if (!row) {
      return res.status(404).json({ message: 'Confession not found' });
    }
    res.json(row);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Create a new confession
router.post('/', async (req, res) => {
  try {
    const { message, author, recipient } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const authorValue = author || 'Anonymous';
    const recipientValue = recipient || null;

    const result = db.run(
      'INSERT INTO confessions (message, author, recipient) VALUES (?, ?, ?)',
      [message, authorValue, recipientValue]
    );

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
router.delete('/:id', async (req, res) => {
  try {
    const result = db.run('DELETE FROM confessions WHERE id = ?', [req.params.id]);

    if (result.changes === 0) {
      return res.status(404).json({ message: 'Confession not found' });
    }

    res.json({ message: 'Confession deleted successfully' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
