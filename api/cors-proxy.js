// Enhanced CORS Proxy Serverless Function
const axios = require('axios');

module.exports = async (req, res) => {
  // Set CORS headers to allow requests from specific origins
  const allowedOrigins = ['https://students.iitgn.ac.in', 'http://localhost:3000'];
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    // For development and testing, allow any origin
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Get the target URL from the query parameter or use the request body
    let targetUrl = req.query.url || (req.body && req.body.url);
    const method = (req.query.method || (req.body && req.body.method) || req.method).toUpperCase();

    if (!targetUrl) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    // Default to the backend API if only an endpoint is provided
    if (!targetUrl.startsWith('http')) {
      targetUrl = `https://yearbook25-git-backend-only-jayraj-dulanges-projects.vercel.app/api${targetUrl.startsWith('/') ? targetUrl : '/' + targetUrl}`;
    }

    console.log(`Proxying ${method} request to: ${targetUrl}`);

    // Prepare request options
    const options = {
      method: method,
      url: targetUrl,
      headers: {
        // Forward some headers from the original request
        'Content-Type': req.headers['content-type'] || 'application/json',
        'Accept': req.headers['accept'] || 'application/json',
        'User-Agent': req.headers['user-agent'],
        'Origin': 'https://yearbook25-git-backend-only-jayraj-dulanges-projects.vercel.app',
        'Referer': 'https://yearbook25-git-backend-only-jayraj-dulanges-projects.vercel.app/'
      },
      // Important: Allow requests to go through even with invalid certificates
      validateStatus: function (status) {
        return status >= 200 && status < 600; // Accept all status codes to handle them properly
      },
      maxRedirects: 5,
      timeout: 10000 // 10 seconds timeout
    };

    // Add request body for POST/PUT requests
    if (['POST', 'PUT', 'PATCH'].includes(method) && req.body) {
      options.data = req.body.data || req.body;
    }

    // Make the request to the target URL
    const response = await axios(options);

    // Copy all response headers
    const responseHeaders = response.headers;
    for (const key in responseHeaders) {
      // Skip setting these headers as they're already set or managed by the server
      if (!['access-control-allow-origin', 'access-control-allow-credentials', 'access-control-allow-methods', 'access-control-allow-headers'].includes(key.toLowerCase())) {
        res.setHeader(key, responseHeaders[key]);
      }
    }

    // Return the response with appropriate status code
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Proxy error:', error.message);
    console.error('Error details:', error.stack);

    // Return error details
    const status = error.response ? error.response.status : 500;
    const errorData = {
      error: error.message,
      details: error.response ? error.response.data : 'No response details',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    };

    return res.status(status).json(errorData);
  }
};
