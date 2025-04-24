const express = require('express');
const router = express.Router();
const db = require('../models/database');

// Get all messages
router.get('/', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM messages ORDER BY created_at DESC').all();
    res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Get a single message
router.get('/:id', (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM messages WHERE id = ?').get(req.params.id);
    if (!row) {
      return res.status(404).json({ message: 'Message not found' });
    }
    res.json(row);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Create a new message
router.post('/', (req, res) => {
  const { author, content } = req.body;

  if (!content) {
    return res.status(400).json({ error: 'Content is required' });
  }

  if (!author) {
    return res.status(400).json({ error: 'Author is required' });
  }

  try {
    const insertStmt = db.prepare('INSERT INTO messages (author, content) VALUES (?, ?)');
    const result = insertStmt.run(author, content);

    res.status(201).json({
      id: result.lastInsertRowid,
      author,
      content,
      created_at: new Date()
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

// Delete a message
router.delete('/:id', (req, res) => {
  try {
    const deleteStmt = db.prepare('DELETE FROM messages WHERE id = ?');
    const result = deleteStmt.run(req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({ message: 'Message not found' });
    }

    res.json({ message: 'Message deleted successfully' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
