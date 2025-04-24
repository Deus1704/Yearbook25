# Deployment Guide

This guide explains how to deploy the Yearbook application with separate frontend and backend hosting.

## Backend Deployment on Vercel

1. Make sure you're using the `backend-only` branch which has been updated to use better-sqlite3 instead of sqlite3.

2. Deploy the backend to Vercel using the following steps:
   - Connect your GitHub repository to Vercel
   - Select the `backend-only` branch
   - Vercel will automatically detect the Node.js project
   - The `vercel.json` file will configure the deployment correctly

3. After deployment, note your Vercel deployment URL (e.g., `https://yearbook25-backend.vercel.app`).

## Frontend Deployment

1. Update the `.env.production` file with your Vercel backend URL:
   ```
   REACT_APP_API_URL=https://yearbook25-backend.vercel.app/api
   ```

2. Build the frontend for production:
   ```
   npm run build
   ```

3. Deploy the contents of the `build` directory to your frontend hosting service (e.g., CPanel).

## Important Notes About the Backend

1. **Database Storage**: The Vercel deployment uses an in-memory SQLite database through better-sqlite3. This means:
   - Data will be reset when the Vercel functions go cold (after periods of inactivity)
   - For persistent storage, consider using a database service like MongoDB Atlas, Supabase, or Firebase

2. **File Storage**: Images are stored in the SQLite database as BLOBs. For a production environment, consider:
   - Using a service like AWS S3, Cloudinary, or Firebase Storage for image storage
   - Updating the code to store image URLs instead of binary data

## Testing the Deployment

1. After deploying both frontend and backend, visit your frontend URL.
2. Open the browser's developer console and check for any CORS or API connection errors.
3. If you see CORS errors, verify that your backend's CORS configuration is correct.
4. If you see API connection errors, verify that your frontend's `REACT_APP_API_URL` is set correctly.

## Troubleshooting

### CORS Issues
If you're experiencing CORS issues, make sure:
- Your frontend is making requests to the correct backend URL
- Both frontend and backend are using the same protocol (HTTP or HTTPS)

### API Connection Issues
If API calls are failing:
- Check that your Vercel deployment is running and accessible
- Verify the `REACT_APP_API_URL` in your frontend environment
- Check for any network errors in the browser console

### Image Loading Issues
If profile images aren't loading:
- Check that the image URLs are correctly formed
- Verify that the backend can serve binary data
- Check for CORS issues specifically related to image requests

### Vercel Deployment Issues
If you encounter issues with Vercel deployment:
- Check the Vercel deployment logs for errors
- Ensure the `vercel.json` file is correctly configured
- Make sure you're using better-sqlite3 instead of sqlite3
