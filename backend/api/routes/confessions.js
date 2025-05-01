const express = require('express');
const router = express.Router();
const axios = require('axios');

// The actual API URL
const API_URL = 'https://yearbook25-xb9a.onrender.com/api';

// Get all confessions
router.get('/', async (req, res) => {
  try {
    const response = await axios.get(`${API_URL}/confessions`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching confessions:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch confessions',
      message: error.message,
      details: error.response ? error.response.data : 'No response details'
    });
  }
});

// Create a new confession
router.post('/', async (req, res) => {
  try {
    const response = await axios.post(`${API_URL}/confessions`, req.body);
    res.status(201).json(response.data);
  } catch (error) {
    console.error('Error creating confession:', error.message);
    res.status(error.response ? error.response.status : 500).json({ 
      error: 'Failed to create confession',
      message: error.message,
      details: error.response ? error.response.data : 'No response details'
    });
  }
});

module.exports = router;
