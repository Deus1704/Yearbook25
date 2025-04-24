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
try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS memories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      image BLOB NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
} catch (err) {
  console.error('Error creating memories table:', err.message);
}

// Get all memory images
router.get('/', (req, res) => {
  try {
    const rows = db.prepare('SELECT id, name, created_at FROM memories ORDER BY created_at DESC').all();
    res.json(rows || []);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Get a single memory image metadata
router.get('/:id', (req, res) => {
  try {
    const row = db.prepare('SELECT id, name, created_at FROM memories WHERE id = ?').get(req.params.id);
    if (!row) {
      return res.status(404).json({ message: 'Memory not found' });
    }
    res.json(row);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Get memory image file
router.get('/:id/image', (req, res) => {
  try {
    const row = db.prepare('SELECT image FROM memories WHERE id = ?').get(req.params.id);
    if (!row || !row.image) {
      return res.status(404).json({ message: 'Image not found' });
    }
    res.writeHead(200, {
      'Content-Type': 'image/jpeg',
      'Content-Length': row.image.length
    });
    res.end(row.image);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Upload a single memory image
router.post('/', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Image is required' });
  }

  const name = req.body.name || null;
  const image = req.file.buffer;

  try {
    const insertStmt = db.prepare('INSERT INTO memories (name, image) VALUES (?, ?)');
    const result = insertStmt.run(name, image);

    res.status(201).json({
      id: result.lastInsertRowid,
      name,
      created_at: new Date().toISOString()
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

// Upload multiple memory images
router.post('/batch', upload.array('image', 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'At least one image is required' });
  }

  try {
    const uploadedImages = [];
    const insertStmt = db.prepare('INSERT INTO memories (name, image) VALUES (?, ?)');

    // Use a transaction for better performance and atomicity
    const transaction = db.transaction((files) => {
      files.forEach((file, index) => {
        const name = req.body[`name-${index}`] || null;
        const image = file.buffer;

        const result = insertStmt.run(name, image);
        uploadedImages.push({
          id: result.lastInsertRowid,
          name,
          created_at: new Date().toISOString()
        });
      });
      return uploadedImages;
    });

    // Execute the transaction
    const results = transaction(req.files);
    res.status(201).json(results);
  } catch (err) {
    console.error('Error uploading images:', err);
    return res.status(400).json({ error: err.message });
  }
});

module.exports = router;
