import React, { useState, useEffect } from 'react';
import { getGoogleDriveDirectUrl, isGoogleDriveUrl } from '../utils/googleDriveUtils';
import { profilePlaceholder, memoryPlaceholder } from '../assets/profile-placeholder';

/**
 * A component for displaying images from Google Drive with proper error handling
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
  ...rest
}) => {
  const [imageSrc, setImageSrc] = useState('');
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  
  // Determine the default fallback based on the type
  const defaultFallback = type === 'memory' ? memoryPlaceholder : profilePlaceholder;
  
  // Use the provided fallback or the default
  const finalFallback = fallbackSrc || defaultFallback;

  useEffect(() => {
    // Reset state when src changes
    setError(false);
    setLoaded(false);
    
    if (!src) {
      console.warn('No source provided to GoogleDriveImage');
      setImageSrc(finalFallback);
      setError(true);
      return;
    }
    
    // If it's a Google Drive URL, convert it to a direct URL
    if (isGoogleDriveUrl(src)) {
      const directUrl = getGoogleDriveDirectUrl(src);
      console.log(`Converting Google Drive URL: ${src} to direct URL: ${directUrl}`);
      setImageSrc(directUrl);
    } else {
      // Otherwise, use the original URL
      setImageSrc(src);
    }
  }, [src, finalFallback]);

  const handleError = (e) => {
    console.warn(`Failed to load image from URL: ${imageSrc}`);
    
    // Prevent infinite error loop
    if (error) {
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
