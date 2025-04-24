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
  try {
    const rows = db.prepare(`
      SELECT p.*,
             COUNT(c.id) as comment_count
      FROM profiles p
      LEFT JOIN comments c ON p.id = c.profile_id
      GROUP BY p.id
    `).all();
    res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Get single profile with comments
router.get('/:id', (req, res) => {
  try {
    const profile = db.prepare('SELECT * FROM profiles WHERE id = ?').get(req.params.id);

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    const comments = db.prepare('SELECT * FROM comments WHERE profile_id = ?').all(req.params.id);
    profile.comments = comments;
    res.json(profile);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Get profile by user_id
router.get('/user/:userId', (req, res) => {
  console.log('Fetching profile for user_id:', req.params.userId);

  try {
    // Proceed with the query
    const profile = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(req.params.userId);

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
router.post('/', upload.single('image'), (req, res) => {
  const { name, designation, description, user_id } = req.body;
  const image = req.file ? req.file.buffer : null;

  console.log('Creating profile with user_id:', user_id);

  if (!user_id) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    // Check if user already has a profile
    const existingProfile = db.prepare('SELECT id FROM profiles WHERE user_id = ?').get(user_id);

    if (existingProfile) {
      console.log('User already has a profile with ID:', existingProfile.id);
      return res.status(400).json({ error: 'User already has a profile', profileId: existingProfile.id });
    }

    console.log('Creating new profile for user');

    // Create new profile if user doesn't have one
    const insertStmt = db.prepare(`
      INSERT INTO profiles (name, designation, description, image, user_id)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = insertStmt.run(name, designation, description, image, user_id);
    const newId = result.lastInsertRowid;

    console.log('Profile created with ID:', newId);

    res.status(201).json({
      id: newId,
      name,
      designation,
      description,
      user_id
    });
  } catch (err) {
    console.error('Error creating profile:', err);
    return res.status(400).json({ error: 'Error creating profile: ' + err.message });
  }
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

  try {
    // Check if profile exists and belongs to the user
    const profile = db.prepare('SELECT * FROM profiles WHERE id = ?').get(profileId);

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
    let updateStmt;
    if (image) {
      updateStmt = db.prepare(`
        UPDATE profiles
        SET name = ?, designation = ?, description = ?, image = ?, user_id = ?
        WHERE id = ?
      `);
      updateStmt.run(name, designation, description, image, user_id, profileId);
    } else {
      updateStmt = db.prepare(`
        UPDATE profiles
        SET name = ?, designation = ?, description = ?, user_id = ?
        WHERE id = ?
      `);
      updateStmt.run(name, designation, description, user_id, profileId);
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
  } catch (err) {
    console.error('Error updating profile:', err);
    return res.status(400).json({ error: 'Error updating profile: ' + err.message });
  }
});

// Add comment to profile
router.post('/:id/comments', (req, res) => {
  const { author, content } = req.body;
  const profileId = req.params.id;

  try {
    const insertStmt = db.prepare(`
      INSERT INTO comments (profile_id, author, content)
      VALUES (?, ?, ?)
    `);

    const result = insertStmt.run(profileId, author, content);

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
router.get('/:id/image', (req, res) => {
  try {
    const row = db.prepare('SELECT image FROM profiles WHERE id = ?').get(req.params.id);

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

module.exports = router;