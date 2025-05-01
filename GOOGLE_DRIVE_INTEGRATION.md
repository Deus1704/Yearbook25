# Google Drive Integration for Yearbook25 Frontend

This document explains how the frontend handles images stored in Google Drive.

## Overview

The Yearbook25 application now uses Google Drive for file storage instead of storing images directly in the database. This change was made to accommodate Vercel's memory limitations (1GB) and to provide a more scalable and reliable file storage solution.

## Frontend Integration

The frontend has been updated to handle Google Drive file URLs:

1. The API service now accepts direct URLs to images stored in Google Drive
2. Components that display images have been updated to use these direct URLs when available
3. If a direct URL is not available, the components fall back to the API endpoint

### API Service Changes

The `src/services/api.js` file has been updated with helper functions that can use direct URLs:

```javascript
// Helper function to get profile image URL
export const getProfileImageUrl = (id, directUrl = null) => {
  // If a direct URL is provided (from Google Drive), use it
  if (directUrl) {
    return directUrl;
  }
  // Otherwise, use the API endpoint
  return `${API_URL}/profiles/${id}/image`;
};

// Helper function to get memory image URL
export const getMemoryImageUrl = (id, directUrl = null) => {
  // If a direct URL is provided (from Google Drive), use it
  if (directUrl) {
    return directUrl;
  }
  // Otherwise, use the API endpoint
  return `${API_URL}/memories/${id}/image`;
};
```

### Component Changes

Components that display images have been updated to pass the direct URL to the helper functions:

```javascript
<img
  src={getProfileImageUrl(profile.id, profile.image_url)}
  alt={profile.name}
  className="profile-image"
  onError={(e) => {
    e.target.onerror = null;
    e.target.src = 'https://via.placeholder.com/300?text=No+Image';
  }}
/>
```

## How It Works

1. When a user uploads an image, the backend uploads it to Google Drive and stores the file ID and direct URL in the database
2. When the frontend requests profile or memory data, the backend includes the direct URL in the response
3. The frontend uses the direct URL to display the image, falling back to the API endpoint if needed

## Benefits

1. **Improved Performance**: Images are served directly from Google Drive's content delivery network
2. **Reduced Server Load**: The backend doesn't need to handle image serving
3. **Scalability**: Google Drive can handle large numbers of images and high traffic
4. **Reliability**: Google Drive provides built-in redundancy and high availability

## Fallback Mechanism

If the direct URL is not available or fails to load, the frontend falls back to the API endpoint. This ensures that images will still be displayed even if there are issues with Google Drive.

## Testing

To test the Google Drive integration:

1. Create or update a profile with an image
2. Verify that the image is displayed correctly
3. Check the browser console to see which URL is being used (direct URL or API endpoint)

## Troubleshooting

If you encounter issues with images:

1. Check the browser console for errors
2. Verify that the backend is correctly uploading images to Google Drive
3. Check that the direct URLs are being included in the API responses
4. Try clearing your browser cache and reloading the page
