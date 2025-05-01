# CORS Proxy for Yearbook25

This document explains how to use the CORS proxy for the Yearbook25 application.

## What is the CORS Proxy?

The CORS proxy is a server-side endpoint that acts as an intermediary between the frontend and the backend API. It helps to avoid CORS (Cross-Origin Resource Sharing) issues that can occur when making requests from a different domain.

## How to Use the CORS Proxy

### From the Frontend

To use the CORS proxy from the frontend, make a POST request to the `/api/cors-proxy` endpoint with the following parameters:

```javascript
// Example using fetch
fetch('https://yearbook25-git-backend-only-jayraj-dulanges-projects.vercel.app/api/cors-proxy', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    url: 'https://yearbook25-git-backend-only-jayraj-dulanges-projects.vercel.app/api/profiles',
    method: 'GET',
    data: null // Include data for POST/PUT requests
  })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
```

### Using the CORS Fix Script

The CORS fix script automatically intercepts API requests and redirects them through the CORS proxy. To use it, include the script in your HTML before any other scripts that make API requests:

```html
<script src="/cors-fix.js"></script>
```

## Testing the CORS Proxy

You can test the CORS proxy using the provided test script:

```bash
node test-cors-proxy.js
```

This script makes a request to the CORS proxy and verifies that it returns the expected response.

## Troubleshooting

If you're experiencing issues with the CORS proxy:

1. Check the browser console for error messages
2. Verify that the CORS proxy endpoint is accessible
3. Check the server logs for error messages
4. Try using the `/api/cors-debug` endpoint to get detailed information about your CORS setup

## Alternative Solutions

If the CORS proxy doesn't work for your use case, you can try the following alternatives:

1. Use a third-party CORS proxy like corsproxy.io
2. Configure your server to allow CORS requests from your domain
3. Use a serverless function as a proxy

## Deployment

When deploying the application, make sure to update the CORS configuration in the backend to allow requests from your frontend domain. You can do this by adding your domain to the `allowedOrigins` array in `server.js`.
