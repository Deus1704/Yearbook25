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

// Get profile by user_id
router.get('/user/:userId', (req, res) => {
  console.log('Fetching profile for user_id:', req.params.userId);

  // First check if the user_id column exists
  db.all("PRAGMA table_info(profiles)", [], (err, tableInfo) => {
    if (err) {
      console.error('Error checking table schema:', err);
      return res.status(500).json({ error: 'Error checking database schema: ' + err.message });
    }

    console.log('Table info:', tableInfo);

    // Proceed with the query
    db.get('SELECT * FROM profiles WHERE user_id = ?', [req.params.userId], (err, profile) => {
      if (err) {
        console.error('Error fetching profile by user_id:', err);
        return res.status(500).json({ error: 'Database error: ' + err.message });
      }

      console.log('Profile found:', profile);

      if (!profile) {
        return res.status(404).json({ message: 'Profile not found' });
      }

      res.json(profile);
    });
  });
});

// Create new profile
router.post('/', upload.single('image'), (req, res) => {
  const { name, designation, description, user_id } = req.body;
  const image = req.file ? req.file.buffer : null;

  console.log('Creating profile with user_id:', user_id);

  if (!user_id) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  // Check if user already has a profile
  db.get('SELECT id FROM profiles WHERE user_id = ?', [user_id], (err, existingProfile) => {
    if (err) {
      console.error('Error checking for existing profile:', err);
      return res.status(500).json({ error: 'Database error: ' + err.message });
    }

    if (existingProfile) {
      console.log('User already has a profile with ID:', existingProfile.id);
      return res.status(400).json({ error: 'User already has a profile', profileId: existingProfile.id });
    }

    console.log('Creating new profile for user');

    // Create new profile if user doesn't have one
    db.run(`
      INSERT INTO profiles (name, designation, description, image, user_id)
      VALUES (?, ?, ?, ?, ?)
    `, [name, designation, description, image, user_id], function(err) {
      if (err) {
        console.error('Error creating profile:', err);
        return res.status(400).json({ error: 'Error creating profile: ' + err.message });
      }

      console.log('Profile created with ID:', this.lastID);

      res.status(201).json({
        id: this.lastID,
        name,
        designation,
        description,
        user_id
      });
    });
  });
});

// Update existing profile
router.put('/:id', upload.single('image'), (req, res) => {
  const { name, designation, description, user_id } = req.body;
  const profileId = req.params.id;
  const image = req.file ? req.file.buffer : null;

  console.log('Updating profile ID:', profileId, 'for user_id:', user_id);

  if (!user_id) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  // Check if profile exists and belongs to the user
  db.get('SELECT * FROM profiles WHERE id = ?', [profileId], (err, profile) => {
    if (err) {
      console.error('Error checking profile existence:', err);
      return res.status(500).json({ error: 'Database error: ' + err.message });
    }

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // If the profile has a user_id and it doesn't match the requesting user
    if (profile.user_id && profile.user_id !== user_id) {
      console.log('Profile belongs to different user. Profile user_id:', profile.user_id, 'Requesting user_id:', user_id);
      return res.status(403).json({ error: 'Profile belongs to a different user' });
    }

    console.log('Updating profile with new data');

    // Update the profile
    let query, params;
    if (image) {
      query = `
        UPDATE profiles
        SET name = ?, designation = ?, description = ?, image = ?, user_id = ?
        WHERE id = ?
      `;
      params = [name, designation, description, image, user_id, profileId];
    } else {
      query = `
        UPDATE profiles
        SET name = ?, designation = ?, description = ?, user_id = ?
        WHERE id = ?
      `;
      params = [name, designation, description, user_id, profileId];
    }

    db.run(query, params, function(err) {
      if (err) {
        console.error('Error updating profile:', err);
        return res.status(400).json({ error: 'Error updating profile: ' + err.message });
      }

      console.log('Profile updated successfully');

      res.json({
        id: profileId,
        name,
        designation,
        description,
        user_id,
        updated: true
      });
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