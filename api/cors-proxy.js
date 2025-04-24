// Simple CORS Proxy Serverless Function
const axios = require('axios');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
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
        'Content-Type': req.headers['content-type'] || 'application/json',
        'Accept': req.headers['accept'] || 'application/json',
        'User-Agent': req.headers['user-agent'] || 'CORS Proxy',
        'Origin': 'https://yearbook25-git-backend-only-jayraj-dulanges-projects.vercel.app'
      }
    };

    // Add request body for POST/PUT requests
    if (['POST', 'PUT', 'PATCH'].includes(method) && req.body) {
      options.data = req.body.data || req.body;
    }

    // Make the request to the target URL
    const response = await axios(options);

    // Return the response with appropriate status code
    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Proxy error:', error.message);

    // Return error details
    return res.status(500).json({
      error: error.message,
      details: error.response ? error.response.data : 'No response details'
    });
  }
};
