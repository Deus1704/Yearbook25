const express = require('express');
const router = express.Router();
const axios = require('axios');

// The actual API URL
const API_URL = 'https://yearbook25-git-backend-only-jayraj-dulanges-projects.vercel.app/api';

// Get all profiles
router.get('/', async (req, res) => {
  try {
    // Forward the request to the actual API
    const response = await axios.get(`${API_URL}/profiles`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching profiles:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch profiles',
      message: error.message,
      details: error.response ? error.response.data : 'No response details'
    });
  }
});

// Get profile by ID
router.get('/:id', async (req, res) => {
  try {
    const response = await axios.get(`${API_URL}/profiles/${req.params.id}`);
    res.json(response.data);
  } catch (error) {
    console.error(`Error fetching profile ${req.params.id}:`, error.message);
    res.status(error.response ? error.response.status : 500).json({ 
      error: `Failed to fetch profile ${req.params.id}`,
      message: error.message,
      details: error.response ? error.response.data : 'No response details'
    });
  }
});

// Get profile by user ID
router.get('/user/:userId', async (req, res) => {
  try {
    const response = await axios.get(`${API_URL}/profiles/user/${req.params.userId}`);
    res.json(response.data);
  } catch (error) {
    console.error(`Error fetching profile for user ${req.params.userId}:`, error.message);
    res.status(error.response ? error.response.status : 500).json({ 
      error: `Failed to fetch profile for user ${req.params.userId}`,
      message: error.message,
      details: error.response ? error.response.data : 'No response details'
    });
  }
});

// Create new profile
router.post('/', async (req, res) => {
  try {
    const response = await axios.post(`${API_URL}/profiles`, req.body);
    res.status(201).json(response.data);
  } catch (error) {
    console.error('Error creating profile:', error.message);
    res.status(error.response ? error.response.status : 500).json({ 
      error: 'Failed to create profile',
      message: error.message,
      details: error.response ? error.response.data : 'No response details'
    });
  }
});

// Update profile
router.put('/:id', async (req, res) => {
  try {
    const response = await axios.put(`${API_URL}/profiles/${req.params.id}`, req.body);
    res.json(response.data);
  } catch (error) {
    console.error(`Error updating profile ${req.params.id}:`, error.message);
    res.status(error.response ? error.response.status : 500).json({ 
      error: `Failed to update profile ${req.params.id}`,
      message: error.message,
      details: error.response ? error.response.data : 'No response details'
    });
  }
});

// Get profile image
router.get('/:id/image', async (req, res) => {
  try {
    const response = await axios.get(`${API_URL}/profiles/${req.params.id}/image`, {
      responseType: 'arraybuffer'
    });
    
    res.writeHead(200, {
      'Content-Type': response.headers['content-type'],
      'Content-Length': response.data.length
    });
    res.end(response.data);
  } catch (error) {
    console.error(`Error fetching profile image ${req.params.id}:`, error.message);
    res.status(error.response ? error.response.status : 500).json({ 
      error: `Failed to fetch profile image ${req.params.id}`,
      message: error.message,
      details: error.response ? error.response.data : 'No response details'
    });
  }
});

module.exports = router;
