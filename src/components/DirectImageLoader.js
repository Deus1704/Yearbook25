import React, { useState, useEffect } from 'react';
import { profilePlaceholder, memoryPlaceholder } from '../assets/profile-placeholder';
import { isGoogleDriveUrl, getGoogleDriveDirectUrl, extractGoogleDriveFileId } from '../utils/googleDriveUtils';

// Import the deletedFilesCache from GoogleDriveImage if possible, or create a new one
// This helps us track which Google Drive files have been deleted
const deletedFilesCache = window.deletedFilesCache || new Set();

/**
 * A component that directly loads images from the server or local placeholders
 * Enhanced to handle Google Drive URLs and CORS issues
 */
const DirectImageLoader = ({
  src,
  alt,
  className,
  type = 'profile',
  fallbackSrc = null,
  onLoad,
  onError,
  ...rest
}) => {
  const [imageSrc, setImageSrc] = useState('');
  const [error, setError] = useState(false);
  const [attemptedFallback, setAttemptedFallback] = useState(false);

  // Determine the default fallback based on the type
  const defaultFallback = type === 'memory' ? memoryPlaceholder : profilePlaceholder;
  // Use provided fallback or default
  const fallbackImage = fallbackSrc || defaultFallback;

  useEffect(() => {
    // Reset state when src changes
    setError(false);
    setAttemptedFallback(false);

    if (!src) {
      console.warn('No source provided to DirectImageLoader');
      setImageSrc(fallbackImage);
      setError(true);
      return;
    }

    console.log(`DirectImageLoader loading image from: ${src}, type: ${type}`);

    // Check if it's a Google Drive URL and if it's in the deleted files cache
    if (isGoogleDriveUrl(src)) {
      const fileId = extractGoogleDriveFileId(src);

      // If this file ID is in our deleted files cache, use the fallback immediately
      if (fileId && deletedFilesCache.has(fileId)) {
        console.warn(`Using fallback for known deleted Google Drive file: ${fileId}`);
        setImageSrc(fallbackImage);
        setError(true);
        return;
      }
    }

    // Check if it's an API URL for a problematic image
    if (src.includes('/api/memories/') && src.includes('/image')) {
      // Extract the ID from the URL
      const idMatch = src.match(/\/memories\/(\d+)\/image/);
      if (idMatch && idMatch[1] === '5') {
        console.warn('Skipping problematic API image URL:', src);
        setImageSrc(fallbackImage);
        setError(true);
        return;
      }
    }

    // Always add a timestamp to prevent caching issues
    const timestamp = new Date().getTime();

    // Check if it's a Google Drive URL and convert it if needed
    if (isGoogleDriveUrl(src)) {
      const directUrl = getGoogleDriveDirectUrl(src);
      console.log(`Converting Google Drive URL: ${src} to direct URL: ${directUrl}`);

      // Add cache-busting parameter
      const urlWithCache = directUrl.includes('?')
        ? `${directUrl}&t=${timestamp}`
        : `${directUrl}?t=${timestamp}`;

      setImageSrc(urlWithCache);
    } else if (src.includes('/api/profiles/') || src.includes('/api/memories/')) {
      // Add cache-busting parameter to API URLs
      const urlWithCache = src.includes('?')
        ? `${src}&t=${timestamp}`
        : `${src}?t=${timestamp}`;
      console.log(`Adding cache-busting to API URL: ${urlWithCache}`);
      setImageSrc(urlWithCache);
    } else {
      // Use the provided source with cache-busting
      const urlWithCache = src.includes('?')
        ? `${src}&t=${timestamp}`
        : `${src}?t=${timestamp}`;
      setImageSrc(urlWithCache);
    }
  }, [src, fallbackImage, type]);

  const handleError = (e) => {
    console.warn(`Failed to load image from URL: ${imageSrc}`);

    // Prevent infinite error loop
    if (error) {
      return;
    }

    // Check if this is a problematic URL (memory ID 5)
    if (imageSrc.includes('/memories/5/image') ||
        (imageSrc.includes('/api/memories/') && imageSrc.match(/\/memories\/(\d+)\/image/) &&
         imageSrc.match(/\/memories\/(\d+)\/image/)[1] === '5')) {
      console.warn('Detected problematic image URL in error handler, using fallback');
      setError(true);
      setImageSrc(fallbackImage);
      return;
    }

    // Try different fallback strategies
    if (!attemptedFallback) {
      setAttemptedFallback(true);

      // Strategy 1: If this is a Google Drive URL that failed, try alternative formats
      if (isGoogleDriveUrl(src)) {
        console.log('Google Drive URL failed, attempting alternative formats');

        // Extract ID from URL if possible
        const fileId = extractGoogleDriveFileId(src);
        if (fileId) {
          // If this file ID is already in the deleted files cache, use fallback immediately
          if (deletedFilesCache.has(fileId)) {
            console.warn(`Using fallback for known deleted Google Drive file: ${fileId}`);
            setError(true);
            setImageSrc(fallbackImage);
            return;
          }

          // Try different URL formats in sequence based on what we've already tried
          if (imageSrc.includes('lh3.googleusercontent.com')) {
            // Try the drive.usercontent.google.com format
            const timestamp = new Date().getTime();
            const alternateUrl = `https://drive.usercontent.google.com/download?id=${fileId}&export=view&t=${timestamp}`;
            console.log(`Trying alternative Google Drive format: ${alternateUrl}`);
            setImageSrc(alternateUrl);
            return;
          }
          else if (imageSrc.includes('drive.usercontent.google.com')) {
            // Try the uc?export=view format
            const timestamp = new Date().getTime();
            const alternateUrl = `https://drive.google.com/uc?export=view&id=${fileId}&t=${timestamp}`;
            console.log(`Trying alternative Google Drive format: ${alternateUrl}`);
            setImageSrc(alternateUrl);
            return;
          }
          else if (imageSrc.includes('uc?export=view')) {
            // Try the export=download format
            const timestamp = new Date().getTime();
            const alternateUrl = `https://drive.google.com/uc?id=${fileId}&export=download&t=${timestamp}`;
            console.log(`Trying alternative Google Drive format: ${alternateUrl}`);
            setImageSrc(alternateUrl);
            return;
          }
          else {
            // If all Google Drive formats failed, try the API endpoint with a fresh timestamp
            const apiBase = type === 'memory' ? '/api/memories/' : '/api/profiles/';
            const timestamp = new Date().getTime();
            const fallbackUrl = `${apiBase}${fileId}/image?t=${timestamp}`;
            console.log(`Using API fallback URL: ${fallbackUrl}`);
            setImageSrc(fallbackUrl);
            return;
          }
        }
      }
      // Strategy 2: If this is an API endpoint that failed, try with a new cache-busting parameter
      else if ((src.includes('/api/profiles/') || src.includes('/api/memories/')) && src.includes('/image')) {
        console.log('API endpoint failed, trying with new cache-busting parameter');
        const timestamp = new Date().getTime();
        const baseUrl = src.split('?')[0];
        const fallbackUrl = `${baseUrl}?t=${timestamp}`;
        console.log(`Using new cache-busting URL: ${fallbackUrl}`);
        setImageSrc(fallbackUrl);
        return;
      }
    }

    // If all fallbacks failed or we've already attempted fallbacks, use the placeholder
    console.log(`All fallbacks failed, using placeholder image for ${type}`);

    // If this is a Google Drive URL that failed, add it to the deleted files cache
    if (isGoogleDriveUrl(src)) {
      const fileId = extractGoogleDriveFileId(src);
      if (fileId) {
        console.warn(`Adding file ID to deleted files cache: ${fileId}`);
        deletedFilesCache.add(fileId);

        // Make the cache available globally for other components
        window.deletedFilesCache = deletedFilesCache;
      }
    }

    setError(true);
    setImageSrc(fallbackImage);

    if (onError) {
      onError(e);
    }
  };

  const handleLoad = (e) => {
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

export default DirectImageLoader;
