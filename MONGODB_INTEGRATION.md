# MongoDB Atlas Integration

This document explains how the Yearbook25 application integrates with MongoDB Atlas for data storage.

## Overview

The application uses MongoDB Atlas as its database service instead of a local SQLite database. This change was made to accommodate Vercel's memory limitations (1GB) and to provide a more scalable and reliable database solution.

## Frontend Integration

The frontend has been updated to handle MongoDB-specific data formats:

1. MongoDB uses `_id` as the primary key field, while our frontend expects an `id` field
2. The API service now automatically converts `_id` to `id` for all responses
3. Error handling has been improved to better display MongoDB-specific error messages

### API Service Changes

The `src/services/api.js` file has been updated with a response interceptor that:

1. Checks if the response contains an array of objects with `_id` fields
2. Adds an `id` field to each object that matches the `_id` value
3. For single objects, also adds an `id` field if only `_id` is present
4. Improves error handling to display MongoDB-specific error messages

## Environment Configuration

The frontend uses environment variables to connect to the backend API:

- Development: `.env` file with `REACT_APP_API_URL=http://localhost:5000/api`
- Production: `.env.production` file with `REACT_APP_API_URL=https://yearbook25-git-backend-only-jayraj-dulanges-projects.vercel.app/api`

## Backend Integration

The backend integration with MongoDB Atlas is handled in the backend-only branch. The backend:

1. Connects to MongoDB Atlas using the connection string in environment variables
2. Uses Mongoose models for data schema and validation
3. Provides API endpoints that work with MongoDB data

## Testing MongoDB Integration

To test the MongoDB integration:

1. Ensure the backend is running and connected to MongoDB Atlas
2. Use the frontend to create, read, update, and delete data
3. Verify that data is being stored in MongoDB Atlas by checking the MongoDB Atlas dashboard

## Troubleshooting

If you encounter issues with the MongoDB integration:

1. Check the browser console for error messages
2. Verify that the backend is running and connected to MongoDB Atlas
3. Check the MongoDB Atlas dashboard for connection issues
4. Ensure that the MongoDB Atlas connection string is correctly set in the backend environment variables
