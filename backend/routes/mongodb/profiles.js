const express = require('express');
const router = express.Router();
const multer = require('multer');
const Profile = require('../../models/Profile');
const fileStorage = require('../../services/fileStorage');

// Multer configuration for handling file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Get all profiles
router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().select('-image'); // Exclude image data for performance
    res.json(profiles);
  } catch (err) {
    console.error('Error fetching profiles:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Get single profile with comments
router.get('/:id', async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id).select('-image');

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.json(profile);
  } catch (err) {
    console.error('Error fetching profile:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Get profile by user_id
router.get('/user/:userId', async (req, res) => {
  console.log('Fetching profile for user_id:', req.params.userId);

  try {
    const profile = await Profile.findOne({ userId: req.params.userId }).select('-image');

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
  const { name, department, degree, quote, userId, email } = req.body;
  const imageFile = req.file;

  console.log('Creating profile with user_id:', userId);

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    // Check if user already has a profile
    const existingProfile = await Profile.findOne({ userId });

    if (existingProfile) {
      console.log('User already has a profile with ID:', existingProfile._id);
      return res.status(400).json({ 
        error: 'User already has a profile', 
        profileId: existingProfile._id 
      });
    }

    console.log('Creating new profile for user');

    let imageId = null;
    let imageUrl = null;
    let imageData = null;
    let contentType = null;

    // Upload image to Google Drive if provided
    if (imageFile) {
      try {
        const uploadResult = await fileStorage.uploadProfileImage(imageFile.buffer, userId);
        imageId = uploadResult.fileId;
        imageUrl = uploadResult.webContentLink;
        console.log('Image uploaded to Google Drive with ID:', imageId);
      } catch (uploadError) {
        console.error('Error uploading image to Google Drive:', uploadError);
        console.log('Storing image in MongoDB directly as fallback');
        
        // Store the image directly in MongoDB as a fallback
        imageData = imageFile.buffer;
        contentType = imageFile.mimetype;
      }
    }

    // Create new profile
    const newProfile = new Profile({
      userId,
      name,
      email,
      department,
      degree,
      quote,
      imageId,
      imageUrl
    });

    // If we're storing the image directly in MongoDB
    if (imageData) {
      newProfile.image = imageData;
      newProfile.contentType = contentType;
    }

    await newProfile.save();

    console.log('Profile created with ID:', newProfile._id);

    // Return the profile without the image data
    const profileResponse = newProfile.toObject();
    delete profileResponse.image;

    res.status(201).json(profileResponse);
  } catch (err) {
    console.error('Error creating profile:', err);
    return res.status(400).json({ error: 'Error creating profile: ' + err.message });
  }
});

// Update existing profile
router.put('/:id', upload.single('image'), async (req, res) => {
  const { name, department, degree, quote, userId, email } = req.body;
  const profileId = req.params.id;
  const imageFile = req.file;

  console.log('Updating profile ID:', profileId, 'for user_id:', userId);

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    // Check if profile exists and belongs to the user
    const profile = await Profile.findById(profileId);

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // If the profile has a userId and it doesn't match the requesting user
    if (profile.userId && profile.userId !== userId) {
      console.log('Profile belongs to different user. Profile userId:', profile.userId, 'Requesting userId:', userId);
      return res.status(403).json({ error: 'Profile belongs to a different user' });
    }

    console.log('Updating profile with new data');

    // Update basic profile data
    profile.name = name || profile.name;
    profile.email = email || profile.email;
    profile.department = department || profile.department;
    profile.degree = degree || profile.degree;
    profile.quote = quote || profile.quote;
    profile.updatedAt = Date.now();

    // Upload new image to Google Drive if provided
    if (imageFile) {
      try {
        // Delete old image if it exists
        if (profile.imageId) {
          try {
            await fileStorage.deleteFile(profile.imageId);
            console.log('Old image deleted from Google Drive with ID:', profile.imageId);
          } catch (deleteError) {
            console.error('Error deleting old image from Google Drive:', deleteError);
            // Continue even if delete fails
          }
        }

        // Upload new image
        const uploadResult = await fileStorage.uploadProfileImage(imageFile.buffer, userId);
        profile.imageId = uploadResult.fileId;
        profile.imageUrl = uploadResult.webContentLink;
        console.log('New image uploaded to Google Drive with ID:', profile.imageId);
      } catch (uploadError) {
        console.error('Error uploading image to Google Drive:', uploadError);
        console.log('Storing image in MongoDB directly as fallback');
        
        // Store the image directly in MongoDB as a fallback
        profile.image = imageFile.buffer;
        profile.contentType = imageFile.mimetype;
      }
    }

    await profile.save();
    console.log('Profile updated successfully');

    // Return the profile without the image data
    const profileResponse = profile.toObject();
    delete profileResponse.image;

    res.json({
      ...profileResponse,
      updated: true
    });
  } catch (err) {
    console.error('Error updating profile:', err);
    return res.status(400).json({ error: 'Error updating profile: ' + err.message });
  }
});

// Add comment to profile
router.post('/:id/comments', async (req, res) => {
  const { userId, name, text } = req.body;
  const profileId = req.params.id;

  if (!userId || !name || !text) {
    return res.status(400).json({ error: 'User ID, name, and text are required' });
  }

  try {
    const profile = await Profile.findById(profileId);

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const comment = {
      userId,
      name,
      text,
      createdAt: Date.now()
    };

    profile.comments.push(comment);
    await profile.save();

    res.status(201).json(comment);
  } catch (err) {
    console.error('Error adding comment:', err);
    return res.status(400).json({ error: err.message });
  }
});

// Get profile image
router.get('/:id/image', async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id);

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // If we have a direct URL to the image, redirect to it
    if (profile.imageUrl) {
      return res.redirect(profile.imageUrl);
    }

    // If we have a Google Drive image ID, try to fetch it
    if (profile.imageId) {
      try {
        const file = await fileStorage.getProfileImage(profile.imageId);

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
    if (profile.image) {
      res.writeHead(200, {
        'Content-Type': profile.contentType || 'image/jpeg',
        'Content-Length': profile.image.length
      });
      res.end(profile.image);
      return;
    }

    // If we get here, we don't have any image
    return res.status(404).json({ message: 'Image not found' });
  } catch (err) {
    console.error('Error getting profile image:', err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
