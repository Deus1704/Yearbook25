const express = require('express');
const router = express.Router();
const axios = require('axios');

/**
 * CORS Proxy endpoint
 * This endpoint acts as a proxy for API requests to avoid CORS issues
 */

// Handle preflight requests
router.options('*', (req, res) => {
  // Set CORS headers
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-CSRF-Token, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version, Origin, Access-Control-Allow-Methods, Access-Control-Allow-Origin, Access-Control-Allow-Headers');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400'); // 24 hours

  // End the request
  res.status(200).end();
});

// Handle all other requests
router.all('/', async (req, res) => {
  // Set CORS headers
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-CSRF-Token, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version, Origin, Access-Control-Allow-Methods, Access-Control-Allow-Origin, Access-Control-Allow-Headers');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400'); // 24 hours

  try {
    // Get the target URL and method from the request body
    const { url, method = 'GET', data = null, headers = {} } = req.body;

    if (!url) {
      return res.status(400).json({
        error: 'Missing URL parameter',
        message: 'The URL parameter is required'
      });
    }

    console.log(`CORS Proxy: ${method} ${url}`);
    console.log('Request headers:', req.headers);

    // Prepare the request options
    const options = {
      method: method,
      url: url,
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      // Don't throw on 4xx/5xx responses
      validateStatus: status => true
    };

    // Add request body for POST/PUT requests
    if (['POST', 'PUT', 'PATCH'].includes(method) && data) {
      options.data = data;
    }

    // Make the request
    const response = await axios(options);

    // Return the response
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error('CORS Proxy Error:', error.message);

    // Return a detailed error response
    return res.status(500).json({
      error: 'CORS Proxy Error',
      message: error.message,
      stack: process.env.NODE_ENV === 'production' ? undefined : error.stack
    });
  }
});

module.exports = router;
