const express = require('express');
const router = express.Router();
const multer = require('multer');
const db = require('../models/database');
const fileStorage = require('../services/fileStorage');

// Multer configuration for handling file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Get all profiles
router.get('/', async (req, res) => {
  try {
    const rows = db.all(`
      SELECT p.*,
             COUNT(c.id) as comment_count
      FROM profiles p
      LEFT JOIN comments c ON p.id = c.profile_id
      GROUP BY p.id
    `);
    res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Get single profile with comments
router.get('/:id', async (req, res) => {
  try {
    const profile = db.get('SELECT * FROM profiles WHERE id = ?', [req.params.id]);

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    const comments = db.all('SELECT * FROM comments WHERE profile_id = ?', [req.params.id]);
    profile.comments = comments;
    res.json(profile);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Get profile by user_id
router.get('/user/:userId', async (req, res) => {
  console.log('Fetching profile for user_id:', req.params.userId);

  try {
    // Proceed with the query
    const profile = db.get('SELECT * FROM profiles WHERE user_id = ?', [req.params.userId]);

    console.log('Profile found:', profile);

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.json(profile);
  } catch (err) {
    console.error('Error fetching profile by user_id:', err);
    return res.status(500).json({ error: 'Database error: ' + err.message });
  }
});

// Create new profile
router.post('/', upload.single('image'), async (req, res) => {
  const { name, designation, description, user_id } = req.body;
  const imageFile = req.file;

  console.log('Creating profile with user_id:', user_id);

  if (!user_id) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    // Check if user already has a profile
    const existingProfile = db.get('SELECT id FROM profiles WHERE user_id = ?', [user_id]);

    if (existingProfile) {
      console.log('User already has a profile with ID:', existingProfile.id);
      return res.status(400).json({ error: 'User already has a profile', profileId: existingProfile.id });
    }

    console.log('Creating new profile for user');

    let imageId = null;
    let imageUrl = null;

    // Upload image to Google Drive if provided
    if (imageFile) {
      try {
        const uploadResult = await fileStorage.uploadProfileImage(imageFile.buffer, user_id);
        imageId = uploadResult.fileId;
        imageUrl = uploadResult.webContentLink;
        console.log('Image uploaded to Google Drive with ID:', imageId);
      } catch (uploadError) {
        console.error('Error uploading image to Google Drive:', uploadError);
        // Continue without image if upload fails
      }
    }

    // Create new profile if user doesn't have one
    const result = db.run(
      'INSERT INTO profiles (name, designation, description, image_id, image_url, user_id) VALUES (?, ?, ?, ?, ?, ?)',
      [name, designation, description, imageId, imageUrl, user_id]
    );

    const newId = result.lastInsertRowid;

    console.log('Profile created with ID:', newId);

    res.status(201).json({
      id: newId,
      name,
      designation,
      description,
      image_url: imageUrl,
      user_id
    });
  } catch (err) {
    console.error('Error creating profile:', err);
    return res.status(400).json({ error: 'Error creating profile: ' + err.message });
  }
});

// Update existing profile
router.put('/:id', upload.single('image'), async (req, res) => {
  const { name, designation, description, user_id } = req.body;
  const profileId = req.params.id;
  const imageFile = req.file;

  console.log('Updating profile ID:', profileId, 'for user_id:', user_id);

  if (!user_id) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    // Check if profile exists and belongs to the user
    const profile = db.get('SELECT * FROM profiles WHERE id = ?', [profileId]);

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // If the profile has a user_id and it doesn't match the requesting user
    if (profile.user_id && profile.user_id !== user_id) {
      console.log('Profile belongs to different user. Profile user_id:', profile.user_id, 'Requesting user_id:', user_id);
      return res.status(403).json({ error: 'Profile belongs to a different user' });
    }

    console.log('Updating profile with new data');

    let imageId = profile.image_id;
    let imageUrl = profile.image_url;

    // Upload new image to Google Drive if provided
    if (imageFile) {
      try {
        // Delete old image if it exists
        if (profile.image_id) {
          try {
            await fileStorage.deleteFile(profile.image_id);
            console.log('Old image deleted from Google Drive with ID:', profile.image_id);
          } catch (deleteError) {
            console.error('Error deleting old image from Google Drive:', deleteError);
            // Continue even if delete fails
          }
        }

        // Upload new image
        const uploadResult = await fileStorage.uploadProfileImage(imageFile.buffer, user_id);
        imageId = uploadResult.fileId;
        imageUrl = uploadResult.webContentLink;
        console.log('New image uploaded to Google Drive with ID:', imageId);
      } catch (uploadError) {
        console.error('Error uploading image to Google Drive:', uploadError);
        // Continue without changing image if upload fails
      }
    }

    // Update the profile
    db.run(
      'UPDATE profiles SET name = ?, designation = ?, description = ?, image_id = ?, image_url = ?, user_id = ? WHERE id = ?',
      [name, designation, description, imageId, imageUrl, user_id, profileId]
    );

    console.log('Profile updated successfully');

    res.json({
      id: profileId,
      name,
      designation,
      description,
      image_url: imageUrl,
      user_id,
      updated: true
    });
  } catch (err) {
    console.error('Error updating profile:', err);
    return res.status(400).json({ error: 'Error updating profile: ' + err.message });
  }
});

// Add comment to profile
router.post('/:id/comments', async (req, res) => {
  const { author, content } = req.body;
  const profileId = req.params.id;

  try {
    const result = db.run(
      'INSERT INTO comments (profile_id, author, content) VALUES (?, ?, ?)',
      [profileId, author, content]
    );

    res.status(201).json({
      id: result.lastInsertRowid,
      profile_id: profileId,
      author,
      content,
      created_at: new Date()
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

// Get profile image
router.get('/:id/image', async (req, res) => {
  try {
    const profile = db.get('SELECT image_id, image_url FROM profiles WHERE id = ?', [req.params.id]);

    if (!profile || (!profile.image_id && !profile.image_url)) {
      return res.status(404).json({ message: 'Image not found' });
    }

    // If we have a direct URL to the image, redirect to it
    if (profile.image_url) {
      return res.redirect(profile.image_url);
    }

    // Otherwise, fetch the image from Google Drive
    try {
      const file = await fileStorage.getProfileImage(profile.image_id);

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
    console.error('Error getting profile image:', err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;