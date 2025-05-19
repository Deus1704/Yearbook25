import React, { useState, useEffect, useCallback } from 'react';
import { getGoogleDriveDirectUrl, isGoogleDriveUrl, extractGoogleDriveFileId } from '../utils/googleDriveUtils';
import { profilePlaceholder, memoryPlaceholder } from '../assets/profile-placeholder';
import { markMemoryImageAsDeleted, markProfileAsDeleted } from '../services/api';

// Check if we're on a mobile device - only used for mobile-specific fixes
const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

// Create a cache to track deleted Google Drive files to avoid repeated attempts
// Initialize from localStorage if available to persist across page reloads
const initializeDeletedFilesCache = () => {
  // First check if we already have a global cache
  if (window.deletedFilesCache) {
    return window.deletedFilesCache;
  }

  // Try to load from localStorage
  try {
    const cachedIds = localStorage.getItem('deletedFilesCache');
    if (cachedIds) {
      const parsedIds = JSON.parse(cachedIds);
      console.log(`Loaded ${parsedIds.length} deleted file IDs from localStorage`);

      // IMPORTANT FIX: Clear the cache if we're on mobile to prevent persistence issues
      if (isMobileDevice) {
        console.log('Mobile device detected, clearing deleted files cache to fix mobile view issues');
        return new Set();
      }

      return new Set(parsedIds);
    }
  } catch (error) {
    console.error('Error loading deleted files cache from localStorage:', error);
  }

  // If all else fails, create a new empty set
  return new Set();
};

const deletedFilesCache = initializeDeletedFilesCache();

// Make the cache available globally for other components
window.deletedFilesCache = deletedFilesCache;

// Helper function to save the cache to localStorage
const saveDeletedFilesCache = () => {
  try {
    // IMPORTANT FIX: Don't save the cache on mobile devices
    if (isMobileDevice) {
      console.log('Mobile device detected, skipping saving deleted files cache');
      return;
    }

    const idsArray = Array.from(deletedFilesCache);
    localStorage.setItem('deletedFilesCache', JSON.stringify(idsArray));
    console.log(`Saved ${idsArray.length} deleted file IDs to localStorage`);
  } catch (error) {
    console.error('Error saving deleted files cache to localStorage:', error);
  }
};

/**
 * A component for displaying images from Google Drive with proper error handling
 * Enhanced to handle CORS issues with multiple fallback mechanisms
 *
 * @param {Object} props - Component props
 * @param {string} props.src - The image source URL
 * @param {string} props.alt - The alt text for the image
 * @param {string} props.className - The CSS class for the image
 * @param {string} props.fallbackSrc - The fallback image source to use if the main image fails to load
 * @param {string} props.type - The type of image ('profile' or 'memory')
 * @param {Function} props.onLoad - Callback function when the image loads successfully
 * @param {Function} props.onError - Callback function when the image fails to load
 * @returns {React.Component} - The GoogleDriveImage component
 */
const GoogleDriveImage = ({
  src,
  alt,
  className,
  fallbackSrc,
  type = 'profile',
  onLoad,
  onError,
  imageId, // Add imageId prop to identify the image in the database
  ...rest
}) => {
  const [imageSrc, setImageSrc] = useState('');
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [attemptedFormats, setAttemptedFormats] = useState([]);
  const [isDeleted, setIsDeleted] = useState(false);

  // Determine the default fallback based on the type
  const defaultFallback = type === 'memory' ? memoryPlaceholder : profilePlaceholder;

  // Use the provided fallback or the default
  const finalFallback = fallbackSrc || defaultFallback;

  // Function to report a deleted image to the backend
  const reportDeletedImage = useCallback(async (fileId) => {
    if (!fileId || isDeleted) return;

    try {
      // Add to the deleted files cache
      deletedFilesCache.add(fileId);

      // Save the updated cache to localStorage
      saveDeletedFilesCache();

      setIsDeleted(true);

      // Report to the backend based on image type
      if (type === 'memory' && imageId) {
        await markMemoryImageAsDeleted(imageId);
        console.log(`Reported deleted memory image to backend: ${imageId}`);
      } else if (type === 'profile' && imageId) {
        await markProfileAsDeleted(imageId);
        console.log(`Reported deleted profile image to backend: ${imageId}`);
      }
    } catch (error) {
      console.error(`Error reporting deleted ${type} image:`, error);
    }
  }, [type, imageId, isDeleted]);

  useEffect(() => {
    // Reset state when src changes
    setError(false);
    setLoaded(false);
    setAttemptedFormats([]);
    setIsDeleted(false);

    if (!src) {
      console.warn('No source provided to GoogleDriveImage');
      setImageSrc(finalFallback);
      setError(true);
      return;
    }

    // Skip problematic URLs that contain specific memory IDs
    if (src.includes('/memories/5/image')) {
      console.warn('Skipping problematic image URL:', src);
      setImageSrc(finalFallback);
      setError(true);
      return;
    }

    // Check if this is a Google Drive URL and if the file ID is in the deleted files cache
    if (isGoogleDriveUrl(src)) {
      const fileId = extractGoogleDriveFileId(src);

      // If this file ID is in our deleted files cache, use the fallback immediately
      if (fileId && deletedFilesCache.has(fileId)) {
        console.warn(`Using fallback for known deleted Google Drive file: ${fileId}`);
        setImageSrc(finalFallback);
        setError(true);
        setIsDeleted(true);

        // Report to backend if not already reported
        reportDeletedImage(fileId);
        return;
      }

      const directUrl = getGoogleDriveDirectUrl(src);
      console.log(`Converting Google Drive URL: ${src} to direct URL: ${directUrl}`);

      // Add cache-busting parameter to prevent stale images
      const timestamp = new Date().getTime();
      const urlWithCache = directUrl.includes('?')
        ? `${directUrl}&t=${timestamp}`
        : `${directUrl}?t=${timestamp}`;

      setImageSrc(urlWithCache);
      setAttemptedFormats(['lh3-googleusercontent']);
    } else {
      // Check if it's an API URL for a problematic image
      if (src.includes('/api/memories/') && src.includes('/image')) {
        // Extract the ID from the URL
        const idMatch = src.match(/\/memories\/(\d+)\/image/);
        if (idMatch && idMatch[1] === '5') {
          console.warn('Skipping problematic API image URL:', src);
          setImageSrc(finalFallback);
          setError(true);
          return;
        }
      }

      // Otherwise, use the original URL with cache-busting
      const timestamp = new Date().getTime();
      const urlWithCache = src.includes('?')
        ? `${src}&t=${timestamp}`
        : `${src}?t=${timestamp}`;

      setImageSrc(urlWithCache);
    }
  }, [src, finalFallback, reportDeletedImage]);

  const handleError = (e) => {
    console.warn(`Failed to load image from URL: ${imageSrc}`);

    // Check if this is a problematic URL (memory ID 5)
    if (imageSrc.includes('/memories/5/image') ||
        (imageSrc.includes('/api/memories/') && imageSrc.match(/\/memories\/(\d+)\/image/) &&
         imageSrc.match(/\/memories\/(\d+)\/image/)[1] === '5')) {
      console.warn('Detected problematic image URL in error handler, using fallback');
      setError(true);
      setImageSrc(finalFallback);
      return;
    }

    // Try alternative formats if this is a Google Drive URL
    if (isGoogleDriveUrl(src) && attemptedFormats.length < 5) {
      const fileId = extractGoogleDriveFileId(src);

      if (fileId) {
        // If we've tried all formats and still failed, add to deleted files cache
        // But only if we're not on mobile (to prevent mobile-specific issues)
        if (!isMobileDevice &&
            attemptedFormats.includes('drive-usercontent') &&
            attemptedFormats.includes('uc-export-view') &&
            attemptedFormats.includes('uc-export-download')) {
          console.warn(`Adding file ID to deleted files cache: ${fileId}`);
          deletedFilesCache.add(fileId);
          setError(true);
          setImageSrc(finalFallback);
          return;
        }

        let nextUrl = '';

        // Try different URL formats in sequence
        // For mobile devices, we'll try more formats before giving up
        if (isMobileDevice && !attemptedFormats.includes('lh3-direct')) {
          // Try the most direct format first for mobile
          nextUrl = `https://lh3.googleusercontent.com/d/${fileId}`;
          setAttemptedFormats([...attemptedFormats, 'lh3-direct']);
          console.log(`Mobile device: Trying direct lh3 format: ${nextUrl}`);
        }
        else if (!attemptedFormats.includes('drive-usercontent')) {
          nextUrl = `https://drive.usercontent.google.com/download?id=${fileId}&export=view`;
          setAttemptedFormats([...attemptedFormats, 'drive-usercontent']);
          console.log(`Trying alternative format 1: ${nextUrl}`);
        }
        else if (!attemptedFormats.includes('uc-export-view')) {
          nextUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
          setAttemptedFormats([...attemptedFormats, 'uc-export-view']);
          console.log(`Trying alternative format 2: ${nextUrl}`);
        }
        else if (!attemptedFormats.includes('uc-export-download')) {
          nextUrl = `https://drive.google.com/uc?id=${fileId}&export=download`;
          setAttemptedFormats([...attemptedFormats, 'uc-export-download']);
          console.log(`Trying alternative format 3: ${nextUrl}`);
        }
        // For mobile devices only, try the API endpoint as a last resort
        else if (isMobileDevice && !attemptedFormats.includes('api-endpoint') && fileId !== '1xIPRNwC7VIfbb2Nj04SXIG9_MWDfVNL_') {
          const apiBase = type === 'memory' ? '/api/memories/' : '/api/profiles/';
          const timestamp = new Date().getTime();
          nextUrl = `${apiBase}${imageId}/image?t=${timestamp}`;
          setAttemptedFormats([...attemptedFormats, 'api-endpoint']);
          console.log(`Mobile device: Trying API endpoint as fallback: ${nextUrl}`);
        }

        if (nextUrl) {
          // Add cache-busting parameter to prevent stale images
          const timestamp = new Date().getTime();
          const urlWithCache = nextUrl.includes('?')
            ? `${nextUrl}&t=${timestamp}`
            : `${nextUrl}?t=${timestamp}`;

          setImageSrc(urlWithCache);
          return; // Don't set error yet, we're trying another format
        }
      }
    }

    // If we've exhausted all formats or this isn't a Google Drive URL, use the fallback
    if (error) {
      return; // Prevent infinite error loop
    }

    // If this is a Google Drive URL that failed, add it to the deleted files cache
    // But only if we're not on mobile (to prevent mobile-specific issues)
    if (!isMobileDevice && isGoogleDriveUrl(src)) {
      const fileId = extractGoogleDriveFileId(src);
      if (fileId) {
        console.warn(`Adding file ID to deleted files cache: ${fileId}`);
        deletedFilesCache.add(fileId);

        // Save the updated cache to localStorage (this is already skipped on mobile)
        saveDeletedFilesCache();

        // Report to backend if not already reported
        if (imageId) {
          reportDeletedImage(fileId);
        }
      }
    }

    // If we're on mobile, try one more time with the API endpoint directly
    if (isMobileDevice && type === 'memory' && imageId && !attemptedFormats.includes('direct-api-endpoint')) {
      const timestamp = new Date().getTime();
      const apiUrl = `/api/memories/${imageId}/image?t=${timestamp}`;
      console.log(`Mobile device detected, trying direct API endpoint: ${apiUrl}`);
      setAttemptedFormats([...attemptedFormats, 'direct-api-endpoint']);
      setImageSrc(apiUrl);
      return;
    }

    setError(true);
    setImageSrc(finalFallback);

    if (onError) {
      onError(e);
    }
  };

  const handleLoad = (e) => {
    setLoaded(true);

    if (onLoad) {
      onLoad(e);
    }
  };

  return (
    <img
      src={imageSrc}
      alt={alt || 'Image'}
      className={className}
      onError={handleError}
      onLoad={handleLoad}
      crossOrigin="anonymous"
      {...rest}
    />
  );
};

export default GoogleDriveImage;
