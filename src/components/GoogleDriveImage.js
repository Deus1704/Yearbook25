import React, { useState, useEffect, useCallback } from 'react';
import { getGoogleDriveDirectUrl, isGoogleDriveUrl, extractGoogleDriveFileId } from '../utils/googleDriveUtils';
import { profilePlaceholder, memoryPlaceholder } from '../assets/profile-placeholder';
import { markMemoryImageAsDeleted, markProfileAsDeleted } from '../services/api';

// Create a cache to track deleted Google Drive files to avoid repeated attempts
const deletedFilesCache = window.deletedFilesCache || new Set();

// Make the cache available globally for other components
window.deletedFilesCache = deletedFilesCache;

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

    // Check if this is a Google Drive URL and if the file ID is in the deleted files cache
    if (isGoogleDriveUrl(src)) {
      const fileId = extractGoogleDriveFileId(src);

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

    // Try alternative formats if this is a Google Drive URL
    if (isGoogleDriveUrl(src) && attemptedFormats.length < 5) {
      const fileId = extractGoogleDriveFileId(src);

      if (fileId) {
        let nextUrl = '';

        // Try different URL formats in sequence
        if (!attemptedFormats.includes('drive-usercontent')) {
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
        else if (!attemptedFormats.includes('api-endpoint')) {
          // Try the API endpoint as a last resort
          const apiBase = type === 'memory' ? '/api/memories/' : '/api/profiles/';
          nextUrl = `${apiBase}${fileId}/image?t=${new Date().getTime()}`;
          setAttemptedFormats([...attemptedFormats, 'api-endpoint']);
          console.log(`Trying API endpoint as fallback: ${nextUrl}`);
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
