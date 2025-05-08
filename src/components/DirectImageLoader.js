import React, { useState, useEffect } from 'react';
import { profilePlaceholder, memoryPlaceholder } from '../assets/profile-placeholder';
import { isGoogleDriveUrl, getGoogleDriveDirectUrl, extractGoogleDriveFileId } from '../utils/googleDriveUtils';

/**
 * A component that directly loads images from the server or local placeholders
 * Enhanced to handle Google Drive URLs and CORS issues
 */
const DirectImageLoader = ({
  src,
  alt,
  className,
  type = 'profile',
  onLoad,
  onError,
  ...rest
}) => {
  const [imageSrc, setImageSrc] = useState('');
  const [error, setError] = useState(false);
  const [attemptedFallback, setAttemptedFallback] = useState(false);

  // Determine the default fallback based on the type
  const fallbackImage = type === 'memory' ? memoryPlaceholder : profilePlaceholder;

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

    // Check if it's a Google Drive URL and convert it if needed
    if (isGoogleDriveUrl(src)) {
      const directUrl = getGoogleDriveDirectUrl(src);
      console.log(`Converting Google Drive URL: ${src} to direct URL: ${directUrl}`);
      setImageSrc(directUrl);
    } else if (src.includes('/api/profiles/') || src.includes('/api/memories/')) {
      // Add cache-busting parameter to API URLs
      const timestamp = new Date().getTime();
      const urlWithCache = src.includes('?')
        ? `${src}&t=${timestamp}`
        : `${src}?t=${timestamp}`;
      console.log(`Adding cache-busting to API URL: ${urlWithCache}`);
      setImageSrc(urlWithCache);
    } else {
      // Use the provided source
      setImageSrc(src);
    }
  }, [src, fallbackImage, type]);

  const handleError = (e) => {
    console.warn(`Failed to load image from URL: ${imageSrc}`);

    // Prevent infinite error loop
    if (error) {
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
          // Try different URL formats in sequence based on what we've already tried
          if (imageSrc.includes('lh3.googleusercontent.com')) {
            // Try the drive.usercontent.google.com format
            const alternateUrl = `https://drive.usercontent.google.com/download?id=${fileId}&export=view`;
            console.log(`Trying alternative Google Drive format: ${alternateUrl}`);
            setImageSrc(alternateUrl);
            return;
          }
          else if (imageSrc.includes('drive.usercontent.google.com')) {
            // Try the uc?export=view format
            const alternateUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
            console.log(`Trying alternative Google Drive format: ${alternateUrl}`);
            setImageSrc(alternateUrl);
            return;
          }
          else if (imageSrc.includes('uc?export=view')) {
            // Try the export=download format
            const alternateUrl = `https://drive.google.com/uc?id=${fileId}&export=download`;
            console.log(`Trying alternative Google Drive format: ${alternateUrl}`);
            setImageSrc(alternateUrl);
            return;
          }
          else {
            // If all Google Drive formats failed, try the API endpoint
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
