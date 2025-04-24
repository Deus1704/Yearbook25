const express = require('express');
const router = express.Router();
const multer = require('multer');
const db = require('../models/database');

// Multer configuration for handling file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Table is created in database.js initialization

// Get all memory images
router.get('/', async (req, res) => {
  try {
    const rows = db.all('SELECT id, name, created_at FROM memories ORDER BY created_at DESC');
    res.json(rows || []);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Get a single memory image metadata
router.get('/:id', async (req, res) => {
  try {
    const row = db.get('SELECT id, name, created_at FROM memories WHERE id = ?', [req.params.id]);
    if (!row) {
      return res.status(404).json({ message: 'Memory not found' });
    }
    res.json(row);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Get memory image file
router.get('/:id/image', async (req, res) => {
  try {
    const row = db.get('SELECT image FROM memories WHERE id = ?', [req.params.id]);
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
router.post('/', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Image is required' });
  }

  const name = req.body.name || null;
  const image = req.file.buffer;

  try {
    const result = db.run(
      'INSERT INTO memories (name, image) VALUES (?, ?)',
      [name, image]
    );

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
router.post('/batch', upload.array('image', 10), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'At least one image is required' });
  }

  try {
    const uploadedImages = [];

    // Process each file individually (no transaction support in sql.js)
    for (const file of req.files) {
      const index = req.files.indexOf(file);
      const name = req.body[`name-${index}`] || null;
      const image = file.buffer;

      const result = db.run(
        'INSERT INTO memories (name, image) VALUES (?, ?)',
        [name, image]
      );

      uploadedImages.push({
        id: result.lastInsertRowid,
        name,
        created_at: new Date().toISOString()
      });
    }

    res.status(201).json(uploadedImages);
  } catch (err) {
    console.error('Error uploading images:', err);
    return res.status(400).json({ error: err.message });
  }
});

module.exports = router;
