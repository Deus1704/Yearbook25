const express = require('express');
const router = express.Router();
const multer = require('multer');
const db = require('../models/database');
const fileStorage = require('../services/fileStorage');
const googleDrive = require('../services/googleDrive');
const checkGraduatingStudent = require('../middleware/graduatingStudentCheck');

// Multer configuration for handling file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Get all profiles
router.get('/', async (req, res) => {
  try {
    // By default, filter out deleted profiles
    // If includeDeleted=true is passed as a query parameter, include deleted profiles
    const includeDeleted = req.query.includeDeleted === 'true';

    let query;
    if (includeDeleted) {
      // Return all profiles including deleted ones
      query = `
        SELECT p.*,
               COUNT(c.id) as comment_count
        FROM profiles p
        LEFT JOIN comments c ON p.id = c.profile_id
        GROUP BY p.id
      `;
    } else {
      // Return only active profiles
      query = `
        SELECT p.*,
               COUNT(c.id) as comment_count
        FROM profiles p
        LEFT JOIN comments c ON p.id = c.profile_id
        WHERE p.status != 'deleted' OR p.status IS NULL
        GROUP BY p.id
      `;
    }

    const rows = db.all(query);
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

// Create new profile - only graduating students can create profiles
router.post('/', upload.single('image'), checkGraduatingStudent, async (req, res) => {
  const { name, designation, description, user_id, email } = req.body;
  const imageFile = req.file;

  console.log('Creating profile with user_id:', user_id, 'and email:', email);

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
    let imageStored = false;

    // Upload image to Google Drive if provided
    if (imageFile) {
      console.log('Image file provided, attempting to upload to Google Drive');
      console.log('Image file size:', imageFile.size, 'bytes');
      console.log('Image file mimetype:', imageFile.mimetype);

      // Check if Google Drive integration is available
      const googleDriveAvailable = typeof fileStorage.uploadProfileImage === 'function';

      if (googleDriveAvailable) {
        try {
          // Verify that the buffer exists and is valid
          if (!imageFile.buffer || imageFile.buffer.length === 0) {
            console.error('Image buffer is empty or invalid');
            throw new Error('Invalid image buffer');
          }

          console.log('Uploading image to Google Drive...');
          const uploadResult = await fileStorage.uploadProfileImage(imageFile.buffer, user_id);

          if (!uploadResult || !uploadResult.fileId) {
            console.error('Upload result is missing fileId:', uploadResult);
            throw new Error('Invalid upload result');
          }

          imageId = uploadResult.fileId;
          imageUrl = uploadResult.webContentLink;
          imageStored = true;
          console.log('Image uploaded to Google Drive successfully');
          console.log('File ID:', imageId);
          console.log('Web Content Link:', imageUrl);
        } catch (uploadError) {
          console.error('Error uploading image to Google Drive:', uploadError);
          console.log('Error details:', uploadError.message);
          console.log('Will try storing image in database as fallback');
        }
      } else {
        console.log('Google Drive integration not available, will store image in database');
      }

      // If Google Drive upload failed or is not available, store in database
      if (!imageStored) {
        try {
          console.log('Storing image directly in database');
          // Create a new profile with the image stored directly
          const result = db.run(
            'INSERT INTO profiles (name, designation, description, image, user_id) VALUES (?, ?, ?, ?, ?)',
            [name, designation, description, imageFile.buffer, user_id]
          );

          const newId = result.lastInsertRowid;
          console.log('Profile created with ID (using direct image storage):', newId);

          res.status(201).json({
            id: newId,
            name,
            designation,
            description,
            user_id
          });

          // Return early since we've already handled the response
          return;
        } catch (dbError) {
          console.error('Error storing image directly in database:', dbError);
          console.log('Error details:', dbError.message);
          console.log('Continuing without image');
          // Continue without image if both methods fail
        }
      }
    } else {
      console.log('No image file provided with profile creation');
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
    console.log(`Getting image for profile ID: ${req.params.id}`);

    // First check if we have Google Drive info
    const profile = db.get('SELECT image_id, image_url, image, status FROM profiles WHERE id = ?', [req.params.id]);

    if (!profile) {
      console.log(`Profile not found with ID: ${req.params.id}`);
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Check if the profile is marked as deleted
    if (profile.status === 'deleted') {
      console.log(`Profile ${req.params.id} is marked as deleted, returning 404`);
      return res.status(404).json({ message: 'Profile has been deleted', status: 'deleted' });
    }

    console.log('Profile image data:', {
      hasImageUrl: !!profile.image_url,
      hasImageId: !!profile.image_id,
      hasDirectImage: !!profile.image,
      imageUrl: profile.image_url,
      imageId: profile.image_id,
      status: profile.status
    });

    // If we have a direct URL to the image, redirect to it
    if (profile.image_url) {
      // First check if the file exists in Google Drive
      if (profile.image_id) {
        const exists = await googleDrive.fileExists(profile.image_id);

        if (!exists) {
          // If the file doesn't exist, update the status and return 404
          db.run('UPDATE profiles SET status = ? WHERE id = ?', ['deleted', req.params.id]);
          console.log(`Profile image ${req.params.id} not found in Google Drive, marked as deleted`);
          return res.status(404).json({ message: 'Image no longer exists in Google Drive', status: 'deleted' });
        }
      }

      console.log(`Redirecting to direct image URL: ${profile.image_url}`);

      // Set cache control headers before redirecting
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');

      return res.redirect(profile.image_url);
    }

    // If we have a Google Drive image ID, try to fetch it
    if (profile.image_id) {
      console.log(`Fetching image from Google Drive with ID: ${profile.image_id}`);

      // First check if the file exists in Google Drive
      const exists = await googleDrive.fileExists(profile.image_id);

      if (!exists) {
        // If the file doesn't exist, update the status and return 404
        db.run('UPDATE profiles SET status = ? WHERE id = ?', ['deleted', req.params.id]);
        console.log(`Profile image ${req.params.id} not found in Google Drive, marked as deleted`);
        return res.status(404).json({ message: 'Image no longer exists in Google Drive', status: 'deleted' });
      }

      // Check if Google Drive integration is available
      const googleDriveAvailable = typeof fileStorage.getProfileImage === 'function';

      if (googleDriveAvailable) {
        try {
          const file = await fileStorage.getProfileImage(profile.image_id);

          if (!file || !file.content) {
            console.error('Invalid file data returned from Google Drive');
            // Mark the profile as deleted
            db.run('UPDATE profiles SET status = ? WHERE id = ?', ['deleted', req.params.id]);
            console.log(`Profile image ${req.params.id} not found in Google Drive, marked as deleted`);
            return res.status(404).json({ message: 'Image no longer exists in Google Drive', status: 'deleted' });
          }

          console.log('Successfully retrieved image from Google Drive');
          console.log('Content type:', file.metadata.mimeType || 'image/jpeg');
          console.log('Content length:', file.content.length);

          // Set cache control headers
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
          res.setHeader('Pragma', 'no-cache');
          res.setHeader('Expires', '0');

          res.writeHead(200, {
            'Content-Type': file.metadata.mimeType || 'image/jpeg',
            'Content-Length': file.content.length
          });
          res.end(file.content);
          return;
        } catch (driveError) {
          console.error('Error fetching image from Google Drive:', driveError);
          console.log('Error details:', driveError.message);

          // Check if the file exists before falling back
          const exists = await googleDrive.fileExists(profile.image_id);

          if (!exists) {
            // If the file doesn't exist, update the status and return 404
            db.run('UPDATE profiles SET status = ? WHERE id = ?', ['deleted', req.params.id]);
            console.log(`Profile image ${req.params.id} not found in Google Drive, marked as deleted`);
            return res.status(404).json({ message: 'Image no longer exists in Google Drive', status: 'deleted' });
          }

          console.log('Falling back to database image if available');
          // Fall through to check for database image
        }
      } else {
        console.log('Google Drive integration not available, falling back to database image');
      }
    }

    // If we have an image stored directly in the database, use that
    if (profile.image) {
      console.log('Using image stored directly in database');
      console.log('Image size:', profile.image.length, 'bytes');

      // Set cache control headers
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');

      res.writeHead(200, {
        'Content-Type': 'image/jpeg',
        'Content-Length': profile.image.length
      });
      res.end(profile.image);
      return;
    }

    // If we get here, we don't have any image
    console.log('No image found for profile');

    // Return a default placeholder image instead of 404
    const fs = require('fs');
    const path = require('path');
    const placeholderPath = path.join(__dirname, '../assets/profile-placeholder.jpg');

    if (fs.existsSync(placeholderPath)) {
      console.log('Serving placeholder image');
      const placeholder = fs.readFileSync(placeholderPath);

      res.writeHead(200, {
        'Content-Type': 'image/jpeg',
        'Content-Length': placeholder.length,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      res.end(placeholder);
      return;
    }

    // If even the placeholder is not available, return 404
    return res.status(404).json({ message: 'Image not found' });
  } catch (err) {
    console.error('Error getting profile image:', err);
    console.error('Stack trace:', err.stack);
    return res.status(500).json({ error: err.message });
  }
});

// Check and update status of profile images
router.post('/check-status', async (req, res) => {
  try {
    // Get all profiles with Google Drive images
    const profiles = db.all(`
      SELECT id, name, image_id, image_url, status
      FROM profiles
      WHERE image_id IS NOT NULL
    `);

    if (!profiles || profiles.length === 0) {
      return res.json({ message: 'No profiles found to check', updated: 0 });
    }

    // Check if the files exist in Google Drive
    const checkedProfiles = await fileStorage.checkFilesExistence(profiles);

    // Update the status of each profile
    let updatedCount = 0;

    for (const profile of checkedProfiles) {
      // If the file doesn't exist and the status is not already 'deleted'
      if (!profile.exists && profile.status !== 'deleted') {
        db.run(
          'UPDATE profiles SET status = ? WHERE id = ?',
          ['deleted', profile.id]
        );
        updatedCount++;
      }
      // If the file exists but the status is 'deleted', update it back to 'active'
      else if (profile.exists && profile.status === 'deleted') {
        db.run(
          'UPDATE profiles SET status = ? WHERE id = ?',
          ['active', profile.id]
        );
        updatedCount++;
      }
    }

    res.json({
      message: `Checked ${checkedProfiles.length} profiles, updated ${updatedCount}`,
      updated: updatedCount,
      total: checkedProfiles.length
    });
  } catch (err) {
    console.error('Error checking profile status:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Mark a profile as deleted
router.put('/:id/mark-deleted', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the profile exists
    const profile = db.get('SELECT * FROM profiles WHERE id = ?', [id]);

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Update the profile status
    db.run(
      'UPDATE profiles SET status = ? WHERE id = ?',
      ['deleted', id]
    );

    res.json({
      id,
      message: 'Profile marked as deleted successfully',
      status: 'deleted'
    });
  } catch (err) {
    console.error('Error marking profile as deleted:', err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;