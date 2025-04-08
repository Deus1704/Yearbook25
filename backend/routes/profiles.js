const express = require('express');
const router = express.Router();
const multer = require('multer');
const db = require('../models/database');

// Multer configuration for handling file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Get all profiles
router.get('/', (req, res) => {
  db.all(`
    SELECT p.*, 
           COUNT(c.id) as comment_count 
    FROM profiles p 
    LEFT JOIN comments c ON p.id = c.profile_id 
    GROUP BY p.id
  `, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Get single profile with comments
router.get('/:id', (req, res) => {
  db.get('SELECT * FROM profiles WHERE id = ?', [req.params.id], (err, profile) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    db.all('SELECT * FROM comments WHERE profile_id = ?', [req.params.id], (err, comments) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      profile.comments = comments;
      res.json(profile);
    });
  });
});

// Create new profile
router.post('/', upload.single('image'), (req, res) => {
  const { name, designation, description } = req.body;
  const image = req.file ? req.file.buffer : null;

  db.run(`
    INSERT INTO profiles (name, designation, description, image)
    VALUES (?, ?, ?, ?)
  `, [name, designation, description, image], function(err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.status(201).json({
      id: this.lastID,
      name,
      designation,
      description
    });
  });
});

// Add comment to profile
router.post('/:id/comments', (req, res) => {
  const { author, content } = req.body;
  const profileId = req.params.id;

  db.run(`
    INSERT INTO comments (profile_id, author, content)
    VALUES (?, ?, ?)
  `, [profileId, author, content], function(err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.status(201).json({
      id: this.lastID,
      profile_id: profileId,
      author,
      content,
      created_at: new Date()
    });
  });
});

// Get profile image
router.get('/:id/image', (req, res) => {
  db.get('SELECT image FROM profiles WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row || !row.image) {
      return res.status(404).json({ message: 'Image not found' });
    }
    res.writeHead(200, {
      'Content-Type': 'image/jpeg',
      'Content-Length': row.image.length
    });
    res.end(row.image);
  });
});

module.exports = router; 