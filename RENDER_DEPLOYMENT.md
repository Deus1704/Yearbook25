# Deploying Yearbook25 Backend to Render

This guide provides instructions for deploying the Yearbook25 backend to Render.com, ensuring proper configuration to avoid CORS issues and other common deployment problems.

## Prerequisites

1. A [Render.com](https://render.com) account
2. Your Google Drive API credentials (credentials.json file)
3. A Google Drive folder for storing images

## Deployment Steps

### 1. Set Up Your Google Drive

1. Create a Google Cloud project and enable the Google Drive API
2. Create a service account with appropriate permissions
3. Download the service account credentials as JSON
4. Create a folder in Google Drive and share it with the service account email
5. Note the folder ID from the URL (the long string after `/folders/` in the URL)

### 2. Prepare Your Repository

1. Make sure your `render.yaml` file is in the root of your repository
2. Ensure your backend code is in the `backend` directory
3. Add your `credentials.json` file to the `backend` directory (but don't commit it to version control)

### 3. Deploy to Render

#### Option 1: Deploy via Dashboard

1. Log in to your Render dashboard
2. Click "New" and select "Blueprint"
3. Connect your repository
4. Render will detect the `render.yaml` file and configure your services
5. Add your environment variables:
   - `GOOGLE_DRIVE_FOLDER_ID`: Your Google Drive folder ID
6. Click "Apply"

#### Option 2: Deploy via CLI

1. Install the Render CLI: `npm install -g @render/cli`
2. Log in: `render login`
3. Deploy: `render blueprint apply`

### 4. Configure Environment Variables

After deployment, go to your service in the Render dashboard and:

1. Add your Google Drive folder ID to the environment variable group
2. Verify all other environment variables are set correctly
3. If needed, add your `credentials.json` content as a secret file

### 5. Verify CORS Configuration

The `render.yaml` file includes CORS headers that should prevent CORS issues. To verify:

1. Wait for your deployment to complete
2. Test an API endpoint: `curl -I https://your-render-url.onrender.com/`
3. Check that the response includes the correct CORS headers

## Troubleshooting

### CORS Issues

If you're still experiencing CORS issues:

1. Check the browser console for specific error messages
2. Verify that your frontend is using the correct backend URL
3. Try the `/api/cors-debug` endpoint to see detailed CORS information
4. Ensure your frontend's domain is included in the `FRONTEND_URL` environment variable

### Deployment Failures

If deployment fails:

1. Check the build logs in the Render dashboard
2. Verify that your `package.json` file has the correct dependencies and scripts
3. Make sure your `credentials.json` file is properly formatted
4. Check that your service has sufficient resources (memory/CPU)

### Google Drive Integration Issues

If Google Drive integration isn't working:

1. Verify that your service account has access to the Google Drive folder
2. Check that your `credentials.json` file is correctly placed in the backend directory
3. Make sure the `GOOGLE_DRIVE_FOLDER_ID` environment variable is set correctly
4. Look for Google API errors in your application logs

## Maintenance

### Updating Your Deployment

To update your deployment:

1. Push changes to your repository
2. Render will automatically rebuild and deploy your service

### Monitoring

Render provides built-in monitoring:

1. View logs in the Render dashboard
2. Set up alerts for service outages
3. Monitor resource usage to ensure you're on the right plan

## Additional Resources

- [Render Documentation](https://render.com/docs)
- [Google Drive API Documentation](https://developers.google.com/drive/api/v3/about-sdk)
- [CORS Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
