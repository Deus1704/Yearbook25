# Google Drive CORS Fix for Yearbook25

This document explains the changes made to fix CORS issues with Google Drive images in the Yearbook25 application.

## Problem

The application was experiencing CORS (Cross-Origin Resource Sharing) issues when trying to load images from Google Drive. This was happening because:

1. Google Drive's URL format `https://drive.google.com/uc?export=view&id=FILE_ID` has CORS restrictions that prevent embedding in websites
2. The browser was blocking requests to Google Drive due to these CORS restrictions
3. This resulted in images not loading and 403 Forbidden errors in the console

## Solution

We implemented a multi-layered approach to fix this issue:

1. Updated the `getGoogleDriveDirectUrl` function in `src/utils/googleDriveUtils.js` to use a more reliable URL format:
   - Changed from: `https://drive.google.com/uc?export=view&id=${fileId}`
   - To: `https://drive.usercontent.google.com/download?id=${fileId}&export=view`

2. Added a fallback mechanism in the `GoogleDriveImage` component that tries different URL formats if the first one fails:
   - First tries: `https://drive.usercontent.google.com/download?id=${fileId}&export=view`
   - If that fails, tries: `https://drive.google.com/uc?export=view&id=${fileId}`
   - If that fails, tries: `https://drive.google.com/uc?id=${fileId}&export=download`
   - If all Google Drive formats fail, falls back to the API endpoint or placeholder image

3. Enhanced the `DirectImageLoader` component with similar fallback logic to handle Google Drive URLs

## Implementation Details

### 1. Updated `getGoogleDriveDirectUrl` function

```javascript
export const getGoogleDriveDirectUrl = (url) => {
  if (!url || typeof url !== 'string') {
    console.warn('Invalid URL provided to getGoogleDriveDirectUrl:', url);
    return url;
  }

  // If it's not a Google Drive URL, return the original URL
  if (!url.includes('drive.google.com') && !url.includes('docs.google.com')) {
    return url;
  }

  // Extract the file ID
  const fileId = extractGoogleDriveFileId(url);
  if (!fileId) {
    console.warn('Could not extract file ID from Google Drive URL:', url);
    return url;
  }

  // Return the direct download URL using the more reliable format
  // This format has fewer CORS issues
  return `https://drive.usercontent.google.com/download?id=${fileId}&export=view`;
};
```

### 2. Enhanced `GoogleDriveImage` component

Added a fallback mechanism that tries different URL formats if the first one fails:

```javascript
const handleError = (e) => {
  console.warn(`Failed to load image from URL: ${imageSrc}`);
  
  // Try alternative formats if this is a Google Drive URL
  if (isGoogleDriveUrl(src) && attemptedFormats.length < 3) {
    const fileId = extractGoogleDriveFileId(src);
    
    if (fileId) {
      let nextUrl = '';
      
      // Try different URL formats in sequence
      if (!attemptedFormats.includes('uc-export-view')) {
        nextUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
        setAttemptedFormats([...attemptedFormats, 'uc-export-view']);
        console.log(`Trying alternative format 1: ${nextUrl}`);
      } else if (!attemptedFormats.includes('uc-export-download')) {
        nextUrl = `https://drive.google.com/uc?id=${fileId}&export=download`;
        setAttemptedFormats([...attemptedFormats, 'uc-export-download']);
        console.log(`Trying alternative format 2: ${nextUrl}`);
      }
      
      if (nextUrl) {
        setImageSrc(nextUrl);
        return; // Don't set error yet, we're trying another format
      }
    }
  }
  
  // If we've exhausted all formats or this isn't a Google Drive URL, use the fallback
  if (error) {
    return; // Prevent infinite error loop
  }
  
  setError(true);
  setImageSrc(finalFallback);
  
  if (onError) {
    onError(e);
  }
};
```

### 3. Enhanced `DirectImageLoader` component

Added similar fallback logic to handle Google Drive URLs:

```javascript
// Strategy 1: If this is a Google Drive URL that failed, try alternative formats
if (isGoogleDriveUrl(src)) {
  console.log('Google Drive URL failed, attempting alternative formats');

  // Extract ID from URL if possible
  const fileId = src.match(/[-\w]{25,}/);
  if (fileId && fileId[0]) {
    // Try a different Google Drive URL format
    if (imageSrc.includes('drive.usercontent.google.com')) {
      // Try the uc?export=view format
      const alternateUrl = `https://drive.google.com/uc?export=view&id=${fileId[0]}`;
      console.log(`Trying alternative Google Drive format: ${alternateUrl}`);
      setImageSrc(alternateUrl);
      return;
    } else if (imageSrc.includes('uc?export=view')) {
      // Try the export=download format
      const alternateUrl = `https://drive.google.com/uc?id=${fileId[0]}&export=download`;
      console.log(`Trying alternative Google Drive format: ${alternateUrl}`);
      setImageSrc(alternateUrl);
      return;
    } else {
      // If all Google Drive formats failed, try the API endpoint
      const apiBase = type === 'memory' ? '/api/memories/' : '/api/profiles/';
      const timestamp = new Date().getTime();
      const fallbackUrl = `${apiBase}${fileId[0]}/image?t=${timestamp}`;
      console.log(`Using API fallback URL: ${fallbackUrl}`);
      setImageSrc(fallbackUrl);
      return;
    }
  }
}
```

## Testing

The changes have been tested with the following:

1. Unit tests for the `googleDriveUtils.js` functions
2. Manual testing with various Google Drive image URLs

## Future Improvements

If CORS issues persist, consider the following options:

1. Use a proxy server to fetch Google Drive images and serve them from your own domain
2. Implement a server-side solution that fetches the images and serves them through your API
3. Consider using a different file storage service that has better CORS support, such as AWS S3 or Cloudinary
