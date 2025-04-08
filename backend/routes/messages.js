const express = require('express');
const router = express.Router();
const db = require('../models/database');

// Get all messages
router.get('/', (req, res) => {
  db.all('SELECT * FROM messages ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Get a single message
router.get('/:id', (req, res) => {
  db.get('SELECT * FROM messages WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ message: 'Message not found' });
    }
    res.json(row);
  });
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

  db.run(
    'INSERT INTO messages (author, content) VALUES (?, ?)',
    [author, content],
    function(err) {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      
      res.status(201).json({
        id: this.lastID,
        author,
        content,
        created_at: new Date()
      });
    }
  );
});

// Delete a message
router.delete('/:id', (req, res) => {
  db.run('DELETE FROM messages WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Message not found' });
    }
    res.json({ message: 'Message deleted successfully' });
  });
});

module.exports = router;
