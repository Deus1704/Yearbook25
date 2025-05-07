const express = require('express');
const router = express.Router();
const Message = require('../../models/Message');

// Get all messages
router.get('/', async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    console.error('Error fetching messages:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Get a single message
router.get('/:id', async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    res.json(message);
  } catch (err) {
    console.error('Error fetching message:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Create a new message
router.post('/', async (req, res) => {
  try {
    const { userId, name, text } = req.body;

    if (!userId || !name || !text) {
      return res.status(400).json({ error: 'User ID, name, and text are required' });
    }

    const newMessage = new Message({
      userId,
      name,
      text,
      createdAt: Date.now()
    });

    await newMessage.save();

    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
});

// Delete a message
router.delete('/:id', async (req, res) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.id);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    res.json({ message: 'Message deleted successfully' });
  } catch (err) {
    console.error('Error deleting message:', err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
