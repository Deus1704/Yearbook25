# CORS Fix for Yearbook25 Frontend

This document explains how the CORS fix works and how to troubleshoot any issues.

## What is CORS?

CORS (Cross-Origin Resource Sharing) is a security feature implemented by browsers that restricts web pages from making requests to a different domain than the one that served the web page. In our case, the frontend is hosted on `students.iitgn.ac.in` and is trying to access the backend API on `yearbook25-git-backend-only-jayraj-dulanges-projects.vercel.app`, which is causing CORS errors.

## How the CORS Fix Works

We've implemented a client-side solution that intercepts all API requests to the backend and routes them through a CORS proxy. This allows the frontend to access the backend API without CORS issues.

The solution consists of a single JavaScript file (`cors-fix.js`) that is loaded in the HTML before any other scripts. This script:

1. Intercepts all `fetch`, `XMLHttpRequest`, and `axios` requests to the backend API
2. Routes these requests through a CORS proxy (`https://corsproxy.io/`)
3. Returns the responses to the frontend as if they came directly from the backend

## Files Added/Modified

- `public/cors-fix.js`: The CORS fix script that intercepts API requests
- `public/index.html`: Modified to include the CORS fix script

## How to Test

1. Deploy the frontend with the CORS fix
2. Open the browser console (F12 or right-click > Inspect > Console)
3. Navigate through the application and check if API requests are successful
4. You should see messages like:
   ```
   CORS Fix Script loaded!
   Intercepting API request to: https://yearbook25-git-backend-only-jayraj-dulanges-projects.vercel.app/api/profiles
   Redirecting to proxy: https://corsproxy.io/?https%3A%2F%2Fyearbook25-git-backend-only-jayraj-dulanges-projects.vercel.app%2Fapi%2Fprofiles
   ```

## Troubleshooting

If you still encounter CORS issues:

1. **Check if the CORS fix script is loaded**: Look for "CORS Fix Script loaded!" in the browser console
2. **Check if API requests are being intercepted**: Look for "Intercepting API request" messages in the console
3. **Try a different CORS proxy**: If `corsproxy.io` is not working, you can modify the `CORS_PROXY_URL` in `cors-fix.js` to use a different proxy service, such as:
   - `https://api.allorigins.win/raw?url=`
   - `https://cors-anywhere.herokuapp.com/`
4. **Check if the backend API is accessible**: Try accessing the API directly in a new browser tab to see if it's available
5. **Check for authentication issues**: The 401 Unauthorized errors suggest there might be authentication issues with the API

## Long-Term Solution

While this client-side CORS proxy solution works for now, a better long-term solution would be to fix the CORS configuration on the backend server. This would allow the frontend to access the backend API directly without the need for a proxy.

To do this, the backend server should include the following headers in its responses:

```
Access-Control-Allow-Origin: https://students.iitgn.ac.in
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

## References

- [CORS Proxy IO](https://corsproxy.io/)
- [MDN Web Docs: CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Using CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
