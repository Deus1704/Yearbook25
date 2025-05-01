# Google Drive Integration for Yearbook25 Backend

This document explains how to set up and use Google Drive for file storage with the Yearbook25 backend.

## Why Google Drive?

We've integrated Google Drive for file storage for several reasons:

1. **Vercel Memory Limitations**: Vercel has a 1GB memory limit, which can be problematic for storing images directly in the database.
2. **Scalability**: Google Drive provides virtually unlimited storage for your images.
3. **Cost-Effective**: Google Drive offers 15GB of free storage, which is sufficient for most yearbook applications.
4. **Reliability**: Google Drive provides built-in redundancy and high availability.

## Setup Instructions

### 1. Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable the Google Drive API for your project

### 2. Create Service Account Credentials

1. In the Google Cloud Console, go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" and select "Service Account"
3. Fill in the service account details and grant it appropriate permissions
4. Create a key for the service account (JSON format)
5. Download the JSON key file

### 3. Set Up Google Drive Folder

1. Create a folder in your Google Drive where images will be stored
2. Share this folder with the service account email address (with Editor permissions)
3. Note the folder ID from the URL (it's the long string after `/folders/` in the URL)

### 4. Configure the Application

1. Place the service account JSON key file in the backend directory as `credentials.json`
2. Update your environment variables with the Google Drive folder ID:

```
# .env.production
GOOGLE_DRIVE_FOLDER_ID=your_folder_id_here
```

## File Storage Structure

The application creates the following folder structure in Google Drive:

- Main Folder (specified by GOOGLE_DRIVE_FOLDER_ID)
  - Profiles (stores profile images)
  - Memories (stores memory images)

## API Endpoints

The application provides the following endpoints for file operations:

### Profiles

- `GET /api/profiles/:id/image` - Get a profile image
- `POST /api/profiles` - Create a profile with an image
- `PUT /api/profiles/:id` - Update a profile and optionally its image

### Memories

- `GET /api/memories` - Get all memories metadata
- `GET /api/memories/:id` - Get a single memory metadata
- `GET /api/memories/:id/image` - Get a memory image
- `POST /api/memories` - Upload a single memory image
- `POST /api/memories/batch` - Upload multiple memory images

## Security Considerations

- The service account credentials are sensitive and should not be committed to version control
- The application uses Google Drive's built-in security features to protect your files
- Images are served via Google Drive's content delivery network for optimal performance

## Local Development

For local development:

1. Create a `.env` file with your Google Drive folder ID
2. Place your `credentials.json` file in the backend directory
3. Run the application as usual

## Vercel Deployment

When deploying to Vercel:

1. Add the `GOOGLE_DRIVE_FOLDER_ID` environment variable in the Vercel project settings
2. Add the contents of your `credentials.json` file as a secret environment variable (e.g., `GOOGLE_CREDENTIALS`)
3. Update the application to read credentials from the environment variable if needed

## Troubleshooting

If you encounter issues with Google Drive integration:

1. **Authentication Issues**: Verify that your credentials.json file is correct and the service account has access to the folder
2. **Permission Issues**: Ensure the service account has Editor permissions on the folder
3. **API Quota Issues**: Check your Google Cloud Console for any quota limitations
4. **File Upload Issues**: Verify that the file size is within limits (the application limits uploads to 10MB)

## Additional Resources

- [Google Drive API Documentation](https://developers.google.com/drive/api/v3/about-sdk)
- [Google Cloud Service Accounts](https://cloud.google.com/iam/docs/service-accounts)
- [Vercel Environment Variables](https://vercel.com/docs/environment-variables)
