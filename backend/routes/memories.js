const express = require('express');
const router = express.Router();
const multer = require('multer');
const db = require('../models/database');

// Multer configuration for handling file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Ensure the memories table exists
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS memories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      image BLOB NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

// Get all memory images
router.get('/', (req, res) => {
  db.all('SELECT id, name, created_at FROM memories ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows || []);
  });
});

// Get a single memory image metadata
router.get('/:id', (req, res) => {
  db.get('SELECT id, name, created_at FROM memories WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ message: 'Memory not found' });
    }
    res.json(row);
  });
});

// Get memory image file
router.get('/:id/image', (req, res) => {
  db.get('SELECT image FROM memories WHERE id = ?', [req.params.id], (err, row) => {
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

// Upload a single memory image
router.post('/', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Image is required' });
  }

  const name = req.body.name || null;
  const image = req.file.buffer;

  db.run(
    'INSERT INTO memories (name, image) VALUES (?, ?)',
    [name, image],
    function(err) {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      
      res.status(201).json({
        id: this.lastID,
        name,
        created_at: new Date().toISOString()
      });
    }
  );
});

// Upload multiple memory images
router.post('/batch', upload.array('image', 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'At least one image is required' });
  }

  const uploadedImages = [];
  let completed = 0;

  req.files.forEach((file, index) => {
    const name = req.body[`name-${index}`] || null;
    const image = file.buffer;

    db.run(
      'INSERT INTO memories (name, image) VALUES (?, ?)',
      [name, image],
      function(err) {
        if (err) {
          console.error('Error uploading image:', err);
          // Continue with other images even if one fails
        } else {
          uploadedImages.push({
            id: this.lastID,
            name,
            created_at: new Date().toISOString()
          });
        }

        completed++;
        if (completed === req.files.length) {
          res.status(201).json(uploadedImages);
        }
      }
    );
  });
});

module.exports = router;
