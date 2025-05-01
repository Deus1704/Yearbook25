# Deploying the Yearbook25 Backend to Vercel

This guide provides instructions for deploying the Yearbook25 backend to Vercel and handling CORS issues.

## Prerequisites

1. A Vercel account
2. The Vercel CLI installed (`npm i -g vercel`)
3. Git repository with your backend code

## Deployment Steps

### 1. Prepare your project

Make sure your project has the following files:
- `server.js` - The main entry point for your Express application
- `vercel.json` - Configuration for Vercel deployment
- `.env.production` - Environment variables for production

### 2. Configure Environment Variables in Vercel

When deploying to Vercel, you need to set the following environment variables:

- `NODE_ENV`: Set to `production`
- `FRONTEND_URL`: Set to your frontend URL (e.g., `https://students.iitgn.ac.in`)
- `CORS_ALLOW_ALL`: Set to `true` to allow all origins (for debugging)

You can set these in the Vercel dashboard under your project settings.

### 3. Deploy to Vercel

You can deploy to Vercel using the CLI:

```bash
# Login to Vercel
vercel login

# Deploy
cd backend
vercel
```

Or connect your GitHub repository to Vercel for automatic deployments.

## Troubleshooting CORS Issues

If you're experiencing CORS issues:

1. Check the CORS configuration in `server.js`
2. Use the `/api/cors-debug` endpoint to see detailed information about your CORS setup
3. Make sure your frontend is using the correct backend URL
4. Verify that your `vercel.json` file has the correct CORS headers

### Testing CORS

You can test CORS with this simple fetch request from your frontend:

```javascript
fetch('https://your-vercel-deployment-url.vercel.app/cors-test', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
```

## Using a CORS Proxy (Alternative Solution)

If you continue to have CORS issues, you can use a CORS proxy:

1. Create a serverless function in your frontend project that acts as a proxy
2. Make all API requests through this proxy instead of directly to the backend

Example proxy function:

```javascript
// api/cors-proxy.js
const axios = require('axios');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { url, method, data } = req.body;
    const response = await axios({
      url,
      method,
      data,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return res.json(response.data);
  } catch (error) {
    return res.status(error.response?.status || 500).json({
      error: error.message,
      details: error.response?.data
    });
  }
};
```

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Express.js CORS Documentation](https://expressjs.com/en/resources/middleware/cors.html)
- [MDN CORS Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
