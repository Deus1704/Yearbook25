const express = require('express');
const router = express.Router();
const multer = require('multer');
const db = require('../models/database');
const fileStorage = require('../services/fileStorage');
const googleDrive = require('../services/googleDrive');
const { sendAdminNotification } = require('../services/notificationService');

// Multer configuration for handling file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Table is created in database.js initialization

// Get all memory images
router.get('/', async (req, res) => {
  try {
    // By default, filter out deleted images
    // If includeDeleted=true is passed as a query parameter, include deleted images
    const includeDeleted = req.query.includeDeleted === 'true';

    let query;
    if (includeDeleted) {
      // Return all images including deleted ones
      query = `
        SELECT id, name, image_id, image_url, uploaded_by, approved, approved_by, approved_at, status, created_at
        FROM memories
        ORDER BY created_at DESC
      `;
    } else {
      // Return only active images
      query = `
        SELECT id, name, image_id, image_url, uploaded_by, approved, approved_by, approved_at, status, created_at
        FROM memories
        WHERE status != 'deleted' OR status IS NULL
        ORDER BY created_at DESC
      `;
    }

    const rows = db.all(query);
    res.json(rows || []);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Get a single memory image metadata
router.get('/:id', async (req, res) => {
  try {
    const row = db.get(
      'SELECT id, name, image_id, image_url, uploaded_by, approved, approved_by, approved_at, created_at FROM memories WHERE id = ?',
      [req.params.id]
    );

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
    const memory = db.get('SELECT image_id, image_url, status FROM memories WHERE id = ?', [req.params.id]);

    if (!memory || (!memory.image_id && !memory.image_url)) {
      return res.status(404).json({ message: 'Image not found' });
    }

    // Check if the image is marked as deleted
    if (memory.status === 'deleted') {
      console.log(`Memory image ${req.params.id} is marked as deleted, returning 404`);
      return res.status(404).json({ message: 'Image has been deleted', status: 'deleted' });
    }

    // If we have a direct URL to the image, redirect to it
    if (memory.image_url) {
      // First check if the file exists in Google Drive
      const exists = await googleDrive.fileExists(memory.image_id);

      if (!exists) {
        // If the file doesn't exist, update the status and return 404
        db.run('UPDATE memories SET status = ? WHERE id = ?', ['deleted', req.params.id]);
        console.log(`Memory image ${req.params.id} not found in Google Drive, marked as deleted`);
        return res.status(404).json({ message: 'Image no longer exists in Google Drive', status: 'deleted' });
      }

      // Set cache control headers before redirecting
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      return res.redirect(memory.image_url);
    }

    // Otherwise, fetch the image from Google Drive
    try {
      const file = await fileStorage.getMemoryImage(memory.image_id);

      // If the file is null, it means it doesn't exist in Google Drive
      if (!file) {
        // Update the status and return 404
        db.run('UPDATE memories SET status = ? WHERE id = ?', ['deleted', req.params.id]);
        console.log(`Memory image ${req.params.id} not found in Google Drive, marked as deleted`);
        return res.status(404).json({ message: 'Image no longer exists in Google Drive', status: 'deleted' });
      }

      res.writeHead(200, {
        'Content-Type': file.metadata.mimeType || 'image/jpeg',
        'Content-Length': file.content.length,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      res.end(file.content);
    } catch (driveError) {
      console.error('Error fetching image from Google Drive:', driveError);

      // If we get here, there was an error fetching the image
      // Let's check if the file exists before returning an error
      const exists = await googleDrive.fileExists(memory.image_id);

      if (!exists) {
        // If the file doesn't exist, update the status and return 404
        db.run('UPDATE memories SET status = ? WHERE id = ?', ['deleted', req.params.id]);
        console.log(`Memory image ${req.params.id} not found in Google Drive, marked as deleted`);
        return res.status(404).json({ message: 'Image no longer exists in Google Drive', status: 'deleted' });
      }

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
  const uploadedBy = req.body.uploadedBy || null;
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

    // Save memory metadata to database with auto-approval
    const result = db.run(
      'INSERT INTO memories (name, image_id, image_url, uploaded_by, approved, approved_at) VALUES (?, ?, ?, ?, ?, ?)',
      [name, imageId, imageUrl, uploadedBy, 1, new Date().toISOString()] // Set approved to 1 (true) by default
    );

    const memoryId = result.lastInsertRowid;

    res.status(201).json({
      id: memoryId,
      name,
      image_id: imageId,
      image_url: imageUrl,
      uploaded_by: uploadedBy,
      approved: true,
      approved_at: new Date().toISOString(),
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

  const uploadedBy = req.body.uploadedBy || null;

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

      // Save memory metadata to database with auto-approval
      const result = db.run(
        'INSERT INTO memories (name, image_id, image_url, uploaded_by, approved, approved_at) VALUES (?, ?, ?, ?, ?, ?)',
        [name, imageId, imageUrl, uploadedBy, 1, new Date().toISOString()] // Set approved to 1 (true) by default
      );

      const memoryId = result.lastInsertRowid;

      uploadedImages.push({
        id: memoryId,
        name,
        image_id: imageId,
        image_url: imageUrl,
        uploaded_by: uploadedBy,
        approved: true,
        approved_at: new Date().toISOString(),
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

// Approve or reject a memory image
router.put('/:id/approve', async (req, res) => {
  const { id } = req.params;
  const { approved, adminEmail } = req.body;

  if (approved === undefined) {
    return res.status(400).json({ error: 'Approval status is required' });
  }

  if (!adminEmail) {
    return res.status(400).json({ error: 'Admin email is required' });
  }

  // Check if the user is an admin
  const isAdmin = adminEmail === 'admin@iitgn.ac.in' ||
                  adminEmail === 'yearbook@iitgn.ac.in' ||
                  adminEmail === 'maprc@iitgn.ac.in' ||
                  adminEmail === 'jayraj.jayraj@iitgn.ac.in';

  if (!isAdmin) {
    return res.status(403).json({ error: 'Only admins can approve or reject memory images' });
  }

  try {
    // Check if the memory exists
    const memory = db.get('SELECT * FROM memories WHERE id = ?', [id]);

    if (!memory) {
      return res.status(404).json({ message: 'Memory not found' });
    }

    // Update the memory's approval status
    const approvedValue = approved ? 1 : 0;
    const approvedAt = approved ? new Date().toISOString() : null;

    db.run(
      'UPDATE memories SET approved = ?, approved_by = ?, approved_at = ? WHERE id = ?',
      [approvedValue, adminEmail, approvedAt, id]
    );

    // Get the updated memory
    const updatedMemory = db.get(
      'SELECT id, name, image_id, image_url, uploaded_by, approved, approved_by, approved_at, created_at FROM memories WHERE id = ?',
      [id]
    );

    res.json({
      ...updatedMemory,
      message: approved ? 'Memory image approved successfully' : 'Memory image rejected successfully'
    });
  } catch (err) {
    console.error('Error updating memory approval status:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Get pending approvals count for admins
router.get('/pending/count', async (req, res) => {
  try {
    const result = db.get('SELECT COUNT(*) as count FROM memories WHERE approved = 0');
    res.json({ count: result.count });
  } catch (err) {
    console.error('Error getting pending approvals count:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Get all pending approvals for admins
router.get('/pending/all', async (req, res) => {
  try {
    const rows = db.all(
      'SELECT id, name, image_id, image_url, uploaded_by, created_at FROM memories WHERE approved = 0 ORDER BY created_at DESC'
    );
    res.json(rows || []);
  } catch (err) {
    console.error('Error getting pending approvals:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Check and update status of memory images
router.post('/check-status', async (req, res) => {
  try {
    // Get all memories
    const memories = db.all(`
      SELECT id, name, image_id, image_url, status
      FROM memories
      WHERE image_id IS NOT NULL
    `);

    if (!memories || memories.length === 0) {
      return res.json({ message: 'No memories found to check', updated: 0 });
    }

    // Check if the files exist in Google Drive
    const checkedMemories = await fileStorage.checkFilesExistence(memories);

    // Update the status of each memory
    let updatedCount = 0;

    for (const memory of checkedMemories) {
      // If the file doesn't exist and the status is not already 'deleted'
      if (!memory.exists && memory.status !== 'deleted') {
        db.run(
          'UPDATE memories SET status = ? WHERE id = ?',
          ['deleted', memory.id]
        );
        updatedCount++;
      }
      // If the file exists but the status is 'deleted', update it back to 'active'
      else if (memory.exists && memory.status === 'deleted') {
        db.run(
          'UPDATE memories SET status = ? WHERE id = ?',
          ['active', memory.id]
        );
        updatedCount++;
      }
    }

    res.json({
      message: `Checked ${checkedMemories.length} memories, updated ${updatedCount}`,
      updated: updatedCount,
      total: checkedMemories.length
    });
  } catch (err) {
    console.error('Error checking memory status:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Mark a memory as deleted
router.put('/:id/mark-deleted', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the memory exists
    const memory = db.get('SELECT * FROM memories WHERE id = ?', [id]);

    if (!memory) {
      return res.status(404).json({ message: 'Memory not found' });
    }

    // Update the memory status
    db.run(
      'UPDATE memories SET status = ? WHERE id = ?',
      ['deleted', id]
    );

    res.json({
      id,
      message: 'Memory marked as deleted successfully',
      status: 'deleted'
    });
  } catch (err) {
    console.error('Error marking memory as deleted:', err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
