const express = require('express');
const router = express.Router();
const Confession = require('../../models/Confession');

// Get all confessions
router.get('/', async (req, res) => {
  try {
    const confessions = await Confession.find().sort({ createdAt: -1 });
    res.json(confessions);
  } catch (err) {
    console.error('Error fetching confessions:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Get a single confession
router.get('/:id', async (req, res) => {
  try {
    const confession = await Confession.findById(req.params.id);
    
    if (!confession) {
      return res.status(404).json({ message: 'Confession not found' });
    }
    
    res.json(confession);
  } catch (err) {
    console.error('Error fetching confession:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Create a new confession
router.post('/', async (req, res) => {
  try {
    const { text, anonymous = true, userId, name } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const newConfession = new Confession({
      text,
      anonymous,
      userId: anonymous ? null : userId,
      name: anonymous ? null : name,
      createdAt: Date.now()
    });

    await newConfession.save();

    res.status(201).json(newConfession);
  } catch (error) {
    console.error('Error creating confession:', error);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
});

// Delete a confession
router.delete('/:id', async (req, res) => {
  try {
    const confession = await Confession.findByIdAndDelete(req.params.id);

    if (!confession) {
      return res.status(404).json({ message: 'Confession not found' });
    }

    res.json({ message: 'Confession deleted successfully' });
  } catch (err) {
    console.error('Error deleting confession:', err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
