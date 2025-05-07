const express = require('express');
const router = express.Router();
const multer = require('multer');
const Memory = require('../../models/Memory');
const fileStorage = require('../../services/fileStorage');
const { sendAdminNotification } = require('../../services/notificationService');

// Multer configuration for handling file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Get all memories
router.get('/', async (req, res) => {
  try {
    // Check if the request is from an admin (based on query parameter)
    const isAdmin = req.query.admin === 'true';

    let query = {};

    // If not admin, only return approved images
    if (!isAdmin) {
      query.approved = true;
    }

    const memories = await Memory.find(query)
      .select('-image')
      .sort({ createdAt: -1 });

    res.json(memories);
  } catch (err) {
    console.error('Error fetching memories:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Get a single memory
router.get('/:id', async (req, res) => {
  try {
    const memory = await Memory.findById(req.params.id).select('-image');

    if (!memory) {
      return res.status(404).json({ message: 'Memory not found' });
    }

    res.json(memory);
  } catch (err) {
    console.error('Error fetching memory:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Get memory image
router.get('/:id/image', async (req, res) => {
  try {
    const memory = await Memory.findById(req.params.id);

    if (!memory) {
      return res.status(404).json({ message: 'Memory not found' });
    }

    // If we have a direct URL to the image, redirect to it
    if (memory.imageUrl) {
      return res.redirect(memory.imageUrl);
    }

    // If we have a Google Drive image ID, try to fetch it
    if (memory.imageId) {
      try {
        const file = await fileStorage.getMemoryImage(memory.imageId);

        res.writeHead(200, {
          'Content-Type': file.metadata.mimeType || 'image/jpeg',
          'Content-Length': file.content.length
        });
        res.end(file.content);
        return;
      } catch (driveError) {
        console.error('Error fetching image from Google Drive:', driveError);
        console.log('Falling back to database image if available');
        // Fall through to check for database image
      }
    }

    // If we have an image stored directly in the database, use that
    if (memory.image) {
      res.writeHead(200, {
        'Content-Type': memory.contentType || 'image/jpeg',
        'Content-Length': memory.image.length
      });
      res.end(memory.image);
      return;
    }

    // If we get here, we don't have any image
    return res.status(404).json({ message: 'Image not found' });
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
  const uploadedBy = req.body.uploadedBy;
  const imageFile = req.file;

  try {
    // Upload image to Google Drive
    let imageId = null;
    let imageUrl = null;
    let imageData = null;
    let contentType = null;

    try {
      const uploadResult = await fileStorage.uploadMemoryImage(imageFile.buffer, name);
      imageId = uploadResult.fileId;
      imageUrl = uploadResult.webContentLink;
      console.log('Memory image uploaded to Google Drive with ID:', imageId);
    } catch (uploadError) {
      console.error('Error uploading memory image to Google Drive:', uploadError);
      console.log('Storing image in MongoDB directly as fallback');

      // Store the image directly in MongoDB as a fallback
      imageData = imageFile.buffer;
      contentType = imageFile.mimetype;
    }

    // Create new memory
    const newMemory = new Memory({
      name,
      uploadedBy,
      imageId,
      imageUrl,
      approved: false,
      createdAt: Date.now()
    });

    // If we're storing the image directly in MongoDB
    if (imageData) {
      newMemory.image = imageData;
      newMemory.contentType = contentType;
    }

    await newMemory.save();

    // Send notification to admins about the new memory image
    try {
      await sendAdminNotification({
        type: 'memory_upload',
        memoryId: newMemory._id.toString(),
        name,
        uploadedBy,
        imageUrl: newMemory.imageUrl,
        timestamp: new Date().toISOString()
      });
      console.log(`Admin notification sent for memory upload (ID: ${newMemory._id})`);
    } catch (notificationError) {
      console.error('Error sending admin notification:', notificationError);
      // Continue even if notification fails
    }

    // Return the memory without the image data
    const memoryResponse = newMemory.toObject();
    delete memoryResponse.image;

    res.status(201).json(memoryResponse);
  } catch (error) {
    console.error('Error creating memory:', error);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
});

// Upload multiple memory images
router.post('/batch', upload.array('images', 10), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'At least one image is required' });
  }

  const uploadedBy = req.body.uploadedBy;
  const results = [];
  const errors = [];

  try {
    // Process each file
    for (const file of req.files) {
      const name = file.originalname || 'Memory';

      try {
        // Upload image to Google Drive
        let imageId = null;
        let imageUrl = null;
        let imageData = null;
        let contentType = null;

        try {
          const uploadResult = await fileStorage.uploadMemoryImage(file.buffer, name);
          imageId = uploadResult.fileId;
          imageUrl = uploadResult.webContentLink;
          console.log('Memory image uploaded to Google Drive with ID:', imageId);
        } catch (uploadError) {
          console.error('Error uploading memory image to Google Drive:', uploadError);
          console.log('Storing image in MongoDB directly as fallback');

          // Store the image directly in MongoDB as a fallback
          imageData = file.buffer;
          contentType = file.mimetype;
        }

        // Create new memory
        const newMemory = new Memory({
          name,
          uploadedBy,
          imageId,
          imageUrl,
          approved: false,
          createdAt: Date.now()
        });

        // If we're storing the image directly in MongoDB
        if (imageData) {
          newMemory.image = imageData;
          newMemory.contentType = contentType;
        }

        await newMemory.save();

        // Send notification to admins about the new memory image
        try {
          await sendAdminNotification({
            type: 'memory_upload',
            memoryId: newMemory._id.toString(),
            name,
            uploadedBy,
            imageUrl: newMemory.imageUrl,
            timestamp: new Date().toISOString()
          });
          console.log(`Admin notification sent for memory upload (ID: ${newMemory._id})`);
        } catch (notificationError) {
          console.error('Error sending admin notification:', notificationError);
          // Continue even if notification fails
        }

        // Add to results
        const memoryResponse = newMemory.toObject();
        delete memoryResponse.image;
        results.push(memoryResponse);
      } catch (error) {
        console.error('Error processing file:', file.originalname, error);
        errors.push({
          file: file.originalname,
          error: error.message
        });
      }
    }

    res.status(201).json({
      success: results.length,
      failed: errors.length,
      results,
      errors
    });
  } catch (error) {
    console.error('Error uploading batch of memories:', error);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
});

// Delete a memory
router.delete('/:id', async (req, res) => {
  try {
    const memory = await Memory.findById(req.params.id);

    if (!memory) {
      return res.status(404).json({ message: 'Memory not found' });
    }

    // Delete from Google Drive if applicable
    if (memory.imageId) {
      try {
        await fileStorage.deleteFile(memory.imageId);
        console.log('Memory image deleted from Google Drive with ID:', memory.imageId);
      } catch (deleteError) {
        console.error('Error deleting memory image from Google Drive:', deleteError);
        // Continue even if delete fails
      }
    }

    // Delete from database
    await Memory.findByIdAndDelete(req.params.id);

    res.json({ message: 'Memory deleted successfully' });
  } catch (err) {
    console.error('Error deleting memory:', err);
    return res.status(500).json({ error: err.message });
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
    const memory = await Memory.findById(id);

    if (!memory) {
      return res.status(404).json({ message: 'Memory not found' });
    }

    // Update the memory's approval status
    memory.approved = approved;
    memory.approvedBy = adminEmail;
    memory.approvedAt = approved ? new Date() : null;

    await memory.save();

    // Return the updated memory without the image data
    const memoryResponse = memory.toObject();
    delete memoryResponse.image;

    res.json({
      ...memoryResponse,
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
    const count = await Memory.countDocuments({ approved: false });
    res.json({ count });
  } catch (err) {
    console.error('Error getting pending approvals count:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Get all pending approvals for admins
router.get('/pending/all', async (req, res) => {
  try {
    const pendingMemories = await Memory.find({ approved: false })
      .select('-image')
      .sort({ createdAt: -1 });

    res.json(pendingMemories);
  } catch (err) {
    console.error('Error getting pending approvals:', err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
