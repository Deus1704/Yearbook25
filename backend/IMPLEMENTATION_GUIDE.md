# Yearbook25 Backend Implementation Guide

This document explains the implementation of the Yearbook25 backend, which supports both SQLite and MongoDB databases and integrates with Google Drive for file storage.

## Architecture Overview

The Yearbook25 backend is built with:

1. **Express.js** - Web server framework
2. **Database Options**:
   - **SQLite** - File-based SQL database (default)
   - **MongoDB** - NoSQL document database (optional)
3. **Google Drive API** - For storing and retrieving images
4. **CORS Configuration** - To allow requests from the frontend

## Key Components

### Database Manager

The `database-manager.js` module provides a unified interface for database operations, supporting both SQLite and MongoDB backends. It:

1. Determines which database to use based on environment variables
2. Provides appropriate routes based on the selected database
3. Includes a migration utility to move data from SQLite to MongoDB

### MongoDB Models

The MongoDB implementation uses Mongoose models:

- `Profile.js` - User profiles with personal information and profile pictures
- `Message.js` - Messages between users
- `Confession.js` - Anonymous or named confessions
- `Memory.js` - Images uploaded by users for the memory lane

### Google Drive Integration

The `googleDrive.js` service handles file storage in Google Drive:

1. Authenticates with Google Drive API using service account credentials
2. Creates folders for different file types (profiles, memories)
3. Uploads, retrieves, and deletes files
4. Makes files publicly accessible for viewing

### API Routes

The backend provides the following API endpoints:

#### Profiles
- `GET /api/profiles` - Get all profiles
- `GET /api/profiles/:id` - Get a specific profile
- `GET /api/profiles/user/:userId` - Get profile by user ID
- `POST /api/profiles` - Create a new profile
- `PUT /api/profiles/:id` - Update a profile
- `GET /api/profiles/:id/image` - Get a profile image
- `POST /api/profiles/:id/comments` - Add a comment to a profile

#### Messages
- `GET /api/messages` - Get all messages
- `GET /api/messages/:id` - Get a specific message
- `POST /api/messages` - Create a new message
- `DELETE /api/messages/:id` - Delete a message

#### Confessions
- `GET /api/confessions` - Get all confessions
- `GET /api/confessions/:id` - Get a specific confession
- `POST /api/confessions` - Create a new confession
- `DELETE /api/confessions/:id` - Delete a confession

#### Memories
- `GET /api/memories` - Get all memories
- `GET /api/memories/:id` - Get a specific memory
- `GET /api/memories/:id/image` - Get a memory image
- `POST /api/memories` - Upload a single memory image
- `POST /api/memories/batch` - Upload multiple memory images
- `DELETE /api/memories/:id` - Delete a memory

## Implementation Details

### Database Switching

The application can switch between SQLite and MongoDB using the `USE_MONGODB` environment variable:

```
# Use MongoDB
USE_MONGODB=true

# Use SQLite (default)
USE_MONGODB=false
```

When the server starts, it:

1. Checks the `USE_MONGODB` environment variable
2. Initializes the appropriate database
3. Loads the corresponding routes

### Google Drive Integration

The application uses Google Drive for file storage, which:

1. Reduces database size by storing images externally
2. Provides better performance for image retrieval
3. Offers virtually unlimited storage capacity

The integration supports:

1. Uploading images to specific folders
2. Retrieving images by ID
3. Making images publicly accessible
4. Deleting images when no longer needed

### Error Handling

The application includes comprehensive error handling:

1. Database connection errors
2. Google Drive API errors
3. File upload/download errors
4. Request validation errors

### CORS Configuration

The application includes CORS configuration to allow requests from:

1. The frontend application (specified by `FRONTEND_URL`)
2. Specific origins for production (e.g., `students.iitgn.ac.in`)
3. Local development origins (`localhost`)

## Deployment

### Render Deployment

For deploying to Render:

1. Set the `MONGODB_URI` environment variable
2. Set `USE_MONGODB=true`
3. Set `GOOGLE_CREDENTIALS` with the contents of your service account JSON file
4. Set `GOOGLE_DRIVE_FOLDER_ID` with your Google Drive folder ID
5. Set `FRONTEND_URL` to your frontend URL

### Vercel Deployment

For deploying to Vercel:

1. Set the `MONGODB_URI` environment variable
2. Set `USE_MONGODB=true`
3. Set `GOOGLE_CREDENTIALS` with the contents of your service account JSON file
4. Set `GOOGLE_DRIVE_FOLDER_ID` with your Google Drive folder ID
5. Set `FRONTEND_URL` to your frontend URL

## Local Development

For local development:

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file with the required environment variables
4. Start the server: `npm run dev`

## Migration

To migrate data from SQLite to MongoDB:

1. Make sure both databases are configured
2. Run: `npm run migrate`

## Troubleshooting

Common issues and solutions:

1. **Database Connection Issues**:
   - Check your connection string
   - Ensure the database server is running
   - Verify network access permissions

2. **Google Drive Issues**:
   - Verify your credentials
   - Check folder permissions
   - Ensure the service account has access to the folder

3. **CORS Issues**:
   - Check the `FRONTEND_URL` environment variable
   - Verify the allowed origins in the CORS configuration
   - Use the CORS debug endpoint: `/api/cors-debug`

4. **File Upload Issues**:
   - Check file size limits
   - Verify the content type
   - Ensure the Google Drive API is enabled

## Conclusion

This implementation provides a flexible, scalable backend for the Yearbook25 application, with support for multiple database options and Google Drive integration for file storage.
