import React, { useState, useEffect } from 'react';
import { profilePlaceholder, memoryPlaceholder } from '../assets/profile-placeholder';
import { isGoogleDriveUrl, getGoogleDriveDirectUrl } from '../utils/googleDriveUtils';

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

    // Check if it's a Google Drive URL and convert it if needed
    if (isGoogleDriveUrl(src)) {
      const directUrl = getGoogleDriveDirectUrl(src);
      console.log(`Converting Google Drive URL: ${src} to direct URL: ${directUrl}`);
      setImageSrc(directUrl);
    } else {
      // Use the provided source
      setImageSrc(src);
    }
  }, [src, fallbackImage]);

  const handleError = (e) => {
    console.warn(`Failed to load image from URL: ${imageSrc}`);

    // Prevent infinite error loop
    if (error) {
      return;
    }

    // If this is a Google Drive URL that failed, try the API endpoint fallback
    if (isGoogleDriveUrl(src) && !attemptedFallback && src.includes('/api/')) {
      console.log('Attempting to load from API endpoint as fallback');
      setAttemptedFallback(true);
      // Extract ID from URL - assuming format like /api/profiles/{id}/image or /api/memories/{id}/image
      const urlParts = src.split('/');
      const idIndex = urlParts.indexOf('profiles') !== -1
        ? urlParts.indexOf('profiles') + 1
        : urlParts.indexOf('memories') + 1;

      if (idIndex < urlParts.length) {
        const id = urlParts[idIndex];
        // Add cache-busting parameter
        const timestamp = new Date().getTime();
        const fallbackUrl = `${src.split('?')[0]}?t=${timestamp}`;
        console.log(`Using fallback URL: ${fallbackUrl}`);
        setImageSrc(fallbackUrl);
        return;
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
