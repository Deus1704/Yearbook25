const express = require('express');
const router = express.Router();
const axios = require('axios');

// The actual API URL
const API_URL = 'https://yearbook25-git-backend-only-jayraj-dulanges-projects.vercel.app/api';

// Get all messages
router.get('/', async (req, res) => {
  try {
    const response = await axios.get(`${API_URL}/messages`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching messages:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch messages',
      message: error.message,
      details: error.response ? error.response.data : 'No response details'
    });
  }
});

// Get a single message
router.get('/:id', async (req, res) => {
  try {
    const response = await axios.get(`${API_URL}/messages/${req.params.id}`);
    res.json(response.data);
  } catch (error) {
    console.error(`Error fetching message ${req.params.id}:`, error.message);
    res.status(error.response ? error.response.status : 500).json({ 
      error: `Failed to fetch message ${req.params.id}`,
      message: error.message,
      details: error.response ? error.response.data : 'No response details'
    });
  }
});

// Create a new message
router.post('/', async (req, res) => {
  try {
    const response = await axios.post(`${API_URL}/messages`, req.body);
    res.status(201).json(response.data);
  } catch (error) {
    console.error('Error creating message:', error.message);
    res.status(error.response ? error.response.status : 500).json({ 
      error: 'Failed to create message',
      message: error.message,
      details: error.response ? error.response.data : 'No response details'
    });
  }
});

module.exports = router;
