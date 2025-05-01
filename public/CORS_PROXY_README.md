# CORS Proxy for Yearbook25 Frontend

This document explains how the CORS proxy works and how to troubleshoot any issues.

## What is CORS?

CORS (Cross-Origin Resource Sharing) is a security feature implemented by browsers that restricts web pages from making requests to a different domain than the one that served the web page. In our case, the frontend is hosted on `students.iitgn.ac.in` and is trying to access the backend API on `yearbook25-git-backend-only-jayraj-dulanges-projects.vercel.app`, which is causing CORS errors.

## How the CORS Fix Works

We've implemented a client-side solution that intercepts all API requests to the backend and routes them through a CORS proxy. This allows the frontend to access the backend API without CORS issues.

The solution consists of a single JavaScript file (`cors-fix.js`) that is loaded in the HTML before any other scripts. This script:

1. Intercepts all `fetch`, `XMLHttpRequest`, and `axios` requests to the backend API
2. Routes these requests through our custom CORS proxy endpoint
3. Falls back to a third-party CORS proxy if our custom proxy fails
4. Returns the responses to the frontend as if they came directly from the backend

## How the Custom CORS Proxy Works

The custom CORS proxy is a server-side endpoint that:

1. Receives a request from the frontend with the target URL, method, and data
2. Makes the request to the target URL on behalf of the frontend
3. Returns the response to the frontend with the appropriate CORS headers

This approach allows the frontend to make requests to the backend without CORS issues, as the proxy is part of the backend and can set the appropriate CORS headers.

## Fallback Mechanism

If the custom CORS proxy fails, the script will automatically fall back to using a third-party CORS proxy service (corsproxy.io). This ensures that the application continues to work even if there are issues with our custom proxy.

## How to Test

1. Deploy the frontend with the CORS fix
2. Open the browser console (F12 or right-click > Inspect > Console)
3. Navigate through the application and check if API requests are successful
4. You should see messages like:
   ```
   CORS Fix Script loaded!
   Intercepting API request to: https://yearbook25-git-backend-only-jayraj-dulanges-projects.vercel.app/api/profiles
   Using custom CORS proxy: https://yearbook25-git-backend-only-jayraj-dulanges-projects.vercel.app/api/cors-proxy
   ```

## Troubleshooting

If you still encounter CORS issues:

1. **Check if the CORS fix script is loaded**: Look for "CORS Fix Script loaded!" in the browser console
2. **Check if API requests are being intercepted**: Look for "Intercepting API request" messages in the console
3. **Check if the custom proxy is working**: Look for "Using custom CORS proxy" messages in the console
4. **Check if the fallback proxy is being used**: Look for "Falling back to third-party proxy" messages in the console
5. **Check if the backend API is accessible**: Try accessing the API directly in a new browser tab to see if it's available
6. **Check for authentication issues**: 401 Unauthorized errors suggest there might be authentication issues with the API

## Long-Term Solution

While this client-side CORS proxy solution works for now, a better long-term solution would be to fix the CORS configuration on the backend server. This would allow the frontend to access the backend API directly without the need for a proxy.

To do this, the backend server should include the following headers in its responses:

```
Access-Control-Allow-Origin: https://students.iitgn.ac.in
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

## References

- [MDN Web Docs: CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Using CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [CORS Proxy IO](https://corsproxy.io/)
