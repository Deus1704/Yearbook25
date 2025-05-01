const express = require('express');
const router = express.Router();
const multer = require('multer');
const db = require('../models/database');
const fileStorage = require('../services/fileStorage');

// Multer configuration for handling file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Table is created in database.js initialization

// Get all memory images
router.get('/', async (req, res) => {
  try {
    const rows = db.all('SELECT id, name, image_id, image_url, created_at FROM memories ORDER BY created_at DESC');
    res.json(rows || []);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Get a single memory image metadata
router.get('/:id', async (req, res) => {
  try {
    const row = db.get('SELECT id, name, image_id, image_url, created_at FROM memories WHERE id = ?', [req.params.id]);
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
    const memory = db.get('SELECT image_id, image_url FROM memories WHERE id = ?', [req.params.id]);

    if (!memory || (!memory.image_id && !memory.image_url)) {
      return res.status(404).json({ message: 'Image not found' });
    }

    // If we have a direct URL to the image, redirect to it
    if (memory.image_url) {
      return res.redirect(memory.image_url);
    }

    // Otherwise, fetch the image from Google Drive
    try {
      const file = await fileStorage.getMemoryImage(memory.image_id);

      res.writeHead(200, {
        'Content-Type': file.metadata.mimeType || 'image/jpeg',
        'Content-Length': file.content.length
      });
      res.end(file.content);
    } catch (driveError) {
      console.error('Error fetching image from Google Drive:', driveError);
      return res.status(500).json({ error: 'Error fetching image from Google Drive' });
    }
  } catch (err) {
    console.error('Error getting memory image:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Upload a single memory image
router.post('/', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Image is required' });
  }

  const name = req.body.name || 'Memory';
  const imageFile = req.file;

  try {
    // Upload image to Google Drive
    let imageId = null;
    let imageUrl = null;

    try {
      const uploadResult = await fileStorage.uploadMemoryImage(imageFile.buffer, name);
      imageId = uploadResult.fileId;
      imageUrl = uploadResult.webContentLink;
      console.log('Memory image uploaded to Google Drive with ID:', imageId);
    } catch (uploadError) {
      console.error('Error uploading memory image to Google Drive:', uploadError);
      return res.status(500).json({ error: 'Error uploading image to Google Drive' });
    }

    // Save memory metadata to database
    const result = db.run(
      'INSERT INTO memories (name, image_id, image_url) VALUES (?, ?, ?)',
      [name, imageId, imageUrl]
    );

    res.status(201).json({
      id: result.lastInsertRowid,
      name,
      image_id: imageId,
      image_url: imageUrl,
      created_at: new Date().toISOString()
    });
  } catch (err) {
    console.error('Error creating memory:', err);
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

    // Process each file individually
    for (const file of req.files) {
      const index = req.files.indexOf(file);
      const name = req.body[`name-${index}`] || `Memory ${index + 1}`;

      // Upload image to Google Drive
      let imageId = null;
      let imageUrl = null;

      try {
        const uploadResult = await fileStorage.uploadMemoryImage(file.buffer, name);
        imageId = uploadResult.fileId;
        imageUrl = uploadResult.webContentLink;
        console.log(`Memory image ${index + 1} uploaded to Google Drive with ID:`, imageId);
      } catch (uploadError) {
        console.error(`Error uploading memory image ${index + 1} to Google Drive:`, uploadError);
        // Skip this image and continue with the next one
        continue;
      }

      // Save memory metadata to database
      const result = db.run(
        'INSERT INTO memories (name, image_id, image_url) VALUES (?, ?, ?)',
        [name, imageId, imageUrl]
      );

      uploadedImages.push({
        id: result.lastInsertRowid,
        name,
        image_id: imageId,
        image_url: imageUrl,
        created_at: new Date().toISOString()
      });
    }

    if (uploadedImages.length === 0) {
      return res.status(500).json({ error: 'Failed to upload any images' });
    }

    res.status(201).json(uploadedImages);
  } catch (err) {
    console.error('Error uploading images:', err);
    return res.status(400).json({ error: err.message });
  }
});

module.exports = router;
