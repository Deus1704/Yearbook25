# Render Deployment Notes for Yearbook25

This document provides important information for deploying the Yearbook25 backend to Render.

## SQLite Configuration

The backend is configured to use SQLite as the database. SQLite is a file-based database that:

1. Requires no additional database service
2. Stores data in a file within the application
3. Is simple to set up and maintain
4. Works well for small to medium-sized applications

## Important Note on Data Persistence

Since SQLite stores data in a file, it's important to note:

1. Render's free tier has ephemeral disk storage, which means the SQLite database file will be reset when the service restarts
2. For production use, consider:
   - Using a persistent disk option on Render
   - Implementing regular database backups
   - Using a service like Google Drive to store database backups

## Google Drive Configuration

The `render.yaml` file is already configured with:

- Google Drive Folder ID: `1FiVd9FkZEA29OT2nlzWbDRImtUuJ_n4l`
- Google Drive credentials from the `credentials.json` file

## CORS Configuration

The CORS configuration is set to allow requests from:
- `https://students.iitgn.ac.in`
- `https://students.iitgn.ac.in/yearbook/2025`

If you need to allow additional origins, add them to the `headers` section in the `render.yaml` file.

## Important Environment Variables

The following environment variables are configured in the `render.yaml` file:

- `PORT`: 5000
- `NODE_ENV`: production
- `FRONTEND_URL`: https://students.iitgn.ac.in/yearbook/2025
- `CORS_ALLOW_ALL`: false
- `GOOGLE_DRIVE_FOLDER_ID`: 1FiVd9FkZEA29OT2nlzWbDRImtUuJ_n4l
- `GOOGLE_CREDENTIALS`: (Service account credentials)
- `USE_MONGODB`: false
- `RENDER`: true
- `RENDER_SERVICE_NAME`: yearbook25-backend

## Deployment Steps

1. Create a Render account if you don't have one
2. Connect your GitHub repository to Render
3. Create a new Blueprint using the `render.yaml` file
4. Deploy the service

## Verifying Deployment

After deployment:

1. Check the service logs for any errors
2. Test the API endpoints using the Render service URL
3. Verify that CORS is working correctly by accessing the API from the frontend
4. Test file uploads to ensure Google Drive integration is working

## Troubleshooting

If you encounter issues:

1. Check the Render logs for error messages
2. Verify that all environment variables are set correctly
3. Test the Google Drive connection
4. Check the CORS configuration

Common issues:

1. **Google Drive API errors**: Ensure the service account has access to the folder
2. **CORS errors**: Verify the frontend URL matches the allowed origins
3. **File upload issues**: Check file size limits and content types
4. **Database errors**: Check for disk space issues or file permission problems

## API Endpoints

The backend provides the following API endpoints:

### Profiles
- `GET /api/profiles` - Get all profiles
- `GET /api/profiles/:id` - Get a specific profile
- `GET /api/profiles/user/:userId` - Get profile by user ID
- `POST /api/profiles` - Create a new profile
- `PUT /api/profiles/:id` - Update a profile
- `GET /api/profiles/:id/image` - Get a profile image

### Messages
- `GET /api/messages` - Get all messages
- `POST /api/messages` - Create a new message

### Confessions
- `GET /api/confessions` - Get all confessions
- `POST /api/confessions` - Create a new confession

### Memories
- `GET /api/memories` - Get all memories
- `POST /api/memories` - Upload a new memory image
