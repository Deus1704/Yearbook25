/**
 * Utility functions for handling Google Drive images
 */

/**
 * Extracts the file ID from a Google Drive URL
 * Handles multiple URL formats:
 * - https://drive.google.com/file/d/FILE_ID/view
 * - https://drive.google.com/open?id=FILE_ID
 * - https://drive.google.com/uc?id=FILE_ID
 * - https://drive.google.com/uc?export=view&id=FILE_ID
 *
 * @param {string} url - The Google Drive URL
 * @returns {string|null} - The file ID or null if not found
 */
export const extractGoogleDriveFileId = (url) => {
  if (!url || typeof url !== 'string') {
    console.warn('Invalid URL provided to extractGoogleDriveFileId:', url);
    return null;
  }

  // Check if it's a Google Drive URL
  if (!url.includes('drive.google.com') && !url.includes('docs.google.com')) {
    return null;
  }

  let fileId = null;

  try {
    // Format: https://drive.google.com/file/d/FILE_ID/view
    if (url.includes('/file/d/')) {
      const parts = url.split('/file/d/');
      if (parts.length > 1) {
        fileId = parts[1].split('/')[0];
      }
    }
    // Format: https://drive.google.com/open?id=FILE_ID
    else if (url.includes('open?id=')) {
      fileId = url.split('open?id=')[1].split('&')[0];
    }
    // Format: https://drive.google.com/uc?id=FILE_ID or https://drive.google.com/uc?export=view&id=FILE_ID
    else if (url.includes('uc?') && url.includes('id=')) {
      const idParam = url.split('id=')[1];
      fileId = idParam ? idParam.split('&')[0] : null;
    }
    // Format: https://drive.google.com/file?id=FILE_ID
    else if (url.includes('file?id=')) {
      fileId = url.split('file?id=')[1].split('&')[0];
    }
    // Format: https://docs.google.com/uc?id=FILE_ID
    else if (url.includes('docs.google.com/uc?id=')) {
      fileId = url.split('docs.google.com/uc?id=')[1].split('&')[0];
    }
  } catch (error) {
    console.error('Error extracting Google Drive file ID:', error);
    return null;
  }

  return fileId;
};

/**
 * Converts a Google Drive URL to a direct download URL
 * This format is more reliable for embedding images
 *
 * @param {string} url - The Google Drive URL
 * @returns {string} - The direct download URL or the original URL if not a Google Drive URL
 */
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

  // Return the direct download URL using the most reliable format for 2024
  // This format works better with CORS restrictions
  return `https://lh3.googleusercontent.com/d/${fileId}`;
};

/**
 * Tests if a URL is a valid Google Drive URL
 *
 * @param {string} url - The URL to test
 * @returns {boolean} - True if the URL is a valid Google Drive URL
 */
export const isGoogleDriveUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return false;
  }

  return (url.includes('drive.google.com') || url.includes('docs.google.com')) &&
         extractGoogleDriveFileId(url) !== null;
};
