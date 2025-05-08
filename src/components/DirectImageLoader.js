import React, { useState, useEffect } from 'react';
import { profilePlaceholder, memoryPlaceholder } from '../assets/profile-placeholder';

/**
 * A component that directly loads images from the server or local placeholders
 * This is a simpler approach that avoids the complexities of Google Drive URLs
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
  
  // Determine the default fallback based on the type
  const fallbackImage = type === 'memory' ? memoryPlaceholder : profilePlaceholder;

  useEffect(() => {
    // Reset state when src changes
    setError(false);
    
    if (!src) {
      console.warn('No source provided to DirectImageLoader');
      setImageSrc(fallbackImage);
      setError(true);
      return;
    }
    
    // Use the provided source
    setImageSrc(src);
  }, [src, fallbackImage]);

  const handleError = (e) => {
    console.warn(`Failed to load image from URL: ${imageSrc}`);
    
    // Prevent infinite error loop
    if (error) {
      return;
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
      {...rest}
    />
  );
};

export default DirectImageLoader;
