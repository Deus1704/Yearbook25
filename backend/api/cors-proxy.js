// Simple CORS proxy for testing
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

// Enable CORS for all routes
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Handle preflight requests
app.options('*', cors());

// Add a simple health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'CORS proxy is running' });
});

// Proxy all requests to the actual API
app.all('*', async (req, res) => {
  const targetUrl = `https://yearbook25-git-backend-only-jayraj-dulanges-projects.vercel.app${req.url}`;
  
  console.log(`Proxying request to: ${targetUrl}`);
  console.log(`Method: ${req.method}`);
  console.log(`Headers: ${JSON.stringify(req.headers)}`);
  
  try {
    const options = {
      method: req.method,
      url: targetUrl,
      headers: {
        ...req.headers,
        host: 'yearbook25-git-backend-only-jayraj-dulanges-projects.vercel.app'
      }
    };
    
    // Add request body for POST/PUT requests
    if (['POST', 'PUT'].includes(req.method)) {
      options.data = req.body;
    }
    
    // Handle binary responses
    if (req.url.includes('/image')) {
      options.responseType = 'arraybuffer';
    }
    
    const response = await axios(options);
    
    // Set response headers
    Object.keys(response.headers).forEach(header => {
      res.setHeader(header, response.headers[header]);
    });
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    
    // Send response
    res.status(response.status).send(response.data);
  } catch (error) {
    console.error('Proxy error:', error.message);
    
    // Set CORS headers even on error
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    
    // Send error response
    res.status(error.response ? error.response.status : 500).json({
      error: 'Proxy error',
      message: error.message,
      details: error.response ? error.response.data : 'No response details'
    });
  }
});

module.exports = app;
