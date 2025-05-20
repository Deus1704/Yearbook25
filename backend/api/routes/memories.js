const express = require('express');
const router = express.Router();
const axios = require('axios');

// The actual API URL
const API_URL = 'https://yearbook25-xb9a.onrender.com/api';

// Get all memory images
router.get('/', async (req, res) => {
  try {
    const response = await axios.get(`${API_URL}/memories`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching memories:', error.message);
    res.status(500).json({
      error: 'Failed to fetch memories',
      message: error.message,
      details: error.response ? error.response.data : 'No response details'
    });
  }
});

// Get a single memory image metadata
router.get('/:id', async (req, res) => {
  try {
    const response = await axios.get(`${API_URL}/memories/${req.params.id}`);
    res.json(response.data);
  } catch (error) {
    console.error(`Error fetching memory ${req.params.id}:`, error.message);
    res.status(error.response ? error.response.status : 500).json({
      error: `Failed to fetch memory ${req.params.id}`,
      message: error.message,
      details: error.response ? error.response.data : 'No response details'
    });
  }
});

// Get memory image file
router.get('/:id/image', async (req, res) => {
  try {
    // Set CORS headers to allow requests from any origin
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    const response = await axios.get(`${API_URL}/memories/${req.params.id}/image`, {
      responseType: 'arraybuffer'
    });

    res.writeHead(200, {
      'Content-Type': response.headers['content-type'],
      'Content-Length': response.data.length,
      'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
    });
    res.end(response.data);
  } catch (error) {
    console.error(`Error fetching memory image ${req.params.id}:`, error.message);

    // Set CORS headers even on error
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    res.status(error.response ? error.response.status : 500).json({
      error: `Failed to fetch memory image ${req.params.id}`,
      message: error.message,
      details: error.response ? error.response.data : 'No response details'
    });
  }
});

// Upload a single memory image
router.post('/', async (req, res) => {
  try {
    const response = await axios.post(`${API_URL}/memories`, req.body);
    res.status(201).json(response.data);
  } catch (error) {
    console.error('Error creating memory:', error.message);
    res.status(error.response ? error.response.status : 500).json({
      error: 'Failed to create memory',
      message: error.message,
      details: error.response ? error.response.data : 'No response details'
    });
  }
});

// Upload multiple memory images
router.post('/batch', async (req, res) => {
  try {
    const response = await axios.post(`${API_URL}/memories/batch`, req.body);
    res.status(201).json(response.data);
  } catch (error) {
    console.error('Error uploading batch memories:', error.message);
    res.status(error.response ? error.response.status : 500).json({
      error: 'Failed to upload batch memories',
      message: error.message,
      details: error.response ? error.response.data : 'No response details'
    });
  }
});

module.exports = router;
