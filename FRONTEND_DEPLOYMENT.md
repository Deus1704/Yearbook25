# Frontend Deployment Guide

This guide explains how to deploy the Yearbook25 frontend to various hosting platforms.

## Prerequisites

Before deploying, make sure you have:

1. A working React frontend application
2. A deployed backend API to connect to
3. Updated the `.env.production` file with the correct backend URL

## Vercel Deployment (Recommended)

Vercel is a cloud platform for static sites and serverless functions that's perfect for React applications.

### Steps for Vercel Deployment

1. Push your code to a GitHub repository
2. Sign up or log in to [Vercel](https://vercel.com)
3. Click "New Project" and import your GitHub repository
4. Vercel will automatically detect that it's a React application
5. Configure the following settings:
   - **Framework Preset**: Create React App
   - **Build Command**: `npm run build` (should be auto-detected)
   - **Output Directory**: `build` (should be auto-detected)
6. Click "Deploy"

The `vercel.json` file in this repository already configures the necessary settings for proper deployment, including routing for client-side routing.

## CPanel Deployment

If you prefer to use CPanel hosting, follow these steps:

1. Build the application locally:
   ```
   npm run build
   ```

2. Compress the contents of the `build` directory into a ZIP file

3. Log in to your CPanel account

4. Navigate to the File Manager and go to the directory where you want to deploy the application (e.g., `public_html` or a subdirectory)

5. Upload and extract the ZIP file

6. If you're deploying to a subdirectory, make sure to update the `homepage` field in `package.json` to match the subdirectory path before building

## Netlify Deployment

Netlify is another excellent platform for hosting React applications:

1. Push your code to a GitHub repository
2. Sign up or log in to [Netlify](https://netlify.com)
3. Click "New site from Git" and select your GitHub repository
4. Configure the following settings:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `build`
5. Click "Deploy site"

## Environment Variables

For any deployment platform, you may need to set environment variables:

- For Vercel: Go to your project settings → Environment Variables and add:
  ```
  REACT_APP_API_URL=https://yearbook25-backend.onrender.com/api
  ```

- For Netlify: Go to your site settings → Build & deploy → Environment → Environment variables and add:
  ```
  REACT_APP_API_URL=https://yearbook25-backend.onrender.com/api
  ```

## Troubleshooting

### 404 Errors on Page Refresh

If you're experiencing 404 errors when refreshing pages or accessing routes directly:

- For Vercel: The included `vercel.json` file should handle this automatically
- For Netlify: Create a `_redirects` file in the `public` directory with:
  ```
  /*    /index.html   200
  ```
- For CPanel: You may need to configure `.htaccess` with:
  ```
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
  ```

### API Connection Issues

If the frontend can't connect to the backend:

1. Check that your backend is deployed and accessible
2. Verify that the `REACT_APP_API_URL` environment variable is set correctly
3. Check for CORS issues - the backend needs to allow requests from your frontend domain
4. Look for network errors in the browser console
