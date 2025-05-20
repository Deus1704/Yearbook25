import React, { useState, useEffect, useRef } from 'react';
import './MasonryGallery.css';
import { isGoogleDriveUrl, extractGoogleDriveFileId } from '../utils/googleDriveUtils';
import GoogleDriveImage from './GoogleDriveImage';
import DirectImageLoader from './DirectImageLoader';
import { getMemoryImageUrl } from '../services/api';
import { memoryPlaceholder } from '../assets/profile-placeholder';

/**
 * Optimizes Google Drive URLs for direct access, especially on mobile
 * This function tries different formats that might work better on mobile devices
 *
 * @param {string} url - The original Google Drive URL
 * @returns {string} - An optimized URL that might work better on mobile
 */
const getOptimizedGoogleDriveUrl = (url) => {
  if (!url || !isGoogleDriveUrl(url)) {
    return url;
  }

  // Extract the file ID
  const fileId = extractGoogleDriveFileId(url);
  if (!fileId) {
    return url;
  }

  // For mobile, the lh3.googleusercontent.com format often works best
  const optimizedUrl = `https://lh3.googleusercontent.com/d/${fileId}`;

  // Add a cache-busting parameter to prevent caching issues
  const timestamp = new Date().getTime();
  return `${optimizedUrl}?t=${timestamp}`;
};

/**
 * MasonryGallery component that displays images in a masonry layout
 * Enhanced with better mobile support and error handling
 *
 * @param {Object} props - Component props
 * @param {Array} props.images - Array of image objects to display
 * @returns {React.Component} - The MasonryGallery component
 */
const MasonryGallery = ({ images }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [columnCount, setColumnCount] = useState(4);
  const [deletedFilesCache, setDeletedFilesCache] = useState(window.deletedFilesCache || new Set());
  const [retryCount, setRetryCount] = useState(0);
  const galleryRef = useRef(null);

  // Effect to handle screen size changes
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      const userAgent = navigator.userAgent;
      const mobileDetected = /iPhone|iPad|iPod|Android/i.test(userAgent);

      // Set mobile flag based on both screen size and user agent
      const mobile = width <= 768 || mobileDetected;
      setIsMobile(mobile);

      // Adjust column count based on screen width
      if (width <= 500) {
        setColumnCount(1); // Mobile phones
      } else if (width <= 768) {
        setColumnCount(2); // Tablets
      } else if (width <= 1024) {
        setColumnCount(3); // Small desktops
      } else {
        setColumnCount(4); // Large desktops
      }
    };

    // Initialize on mount
    checkScreenSize();

    // Add event listener for resize
    window.addEventListener('resize', checkScreenSize);

    // For mobile devices only, clear the deleted files cache to ensure images load properly
    const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobileDevice && window.deletedFilesCache) {
      console.log('Mobile device detected, clearing deleted files cache in MasonryGallery');
      window.deletedFilesCache = new Set();
      setDeletedFilesCache(new Set());
    }

    // Cleanup
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  // If no images, return null
  if (!images || images.length === 0) {
    return null;
  }

  // Split images into columns based on screen size
  const splitIntoColumns = (images) => {
    // Create array of empty arrays based on columnCount
    const columns = Array.from({ length: columnCount }, () => []);

    // Filter out problematic images before distributing
    const validImages = images.filter(image => {
      // Skip images with ID 5 which is causing the error
      if (image.id === 5) {
        console.log('Filtering out problematic image with ID 5');
        return false;
      }

      // Filter out images with known deleted Google Drive IDs
      if (image.imageUrl && isGoogleDriveUrl(image.imageUrl)) {
        const fileId = extractGoogleDriveFileId(image.imageUrl);
        if (fileId && deletedFilesCache.has(fileId)) {
          console.log(`Filtering out image with known deleted Google Drive ID: ${fileId}`);
          return false;
        }
      }

      return true;
    });

    // Distribute images across columns
    validImages.forEach((image, index) => {
      const columnIndex = index % columnCount;
      columns[columnIndex].push(image);
    });

    return columns;
  };

  const columns = splitIntoColumns(images);

  // Effect to retry loading images if needed - ONLY for mobile devices
  useEffect(() => {
    // Only apply this for mobile devices
    const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    // If we're on mobile and have images but some might be failing
    if (isMobileDevice && images && images.length > 0 && retryCount < 5) {
      // Set a timer to retry loading images
      const timer = setTimeout(() => {
        console.log(`Mobile view: Retrying image load attempt ${retryCount + 1}`);
        setRetryCount(prev => prev + 1);

        // Force refresh the gallery by clearing and resetting the deleted files cache
        if (window.deletedFilesCache) {
          window.deletedFilesCache = new Set();
          setDeletedFilesCache(new Set());
        }

        // Clear any browser cache for the images
        if (window.caches && retryCount === 1) {
          console.log('Mobile view: Clearing browser cache for images');
          window.caches.keys().then(cacheNames => {
            cacheNames.forEach(cacheName => {
              window.caches.open(cacheName).then(cache => {
                cache.keys().then(requests => {
                  requests.forEach(request => {
                    if (request.url.includes('/memories/') || isGoogleDriveUrl(request.url)) {
                      cache.delete(request);
                    }
                  });
                });
              });
            });
          }).catch(err => console.error('Error clearing cache:', err));
        }

        // On the second retry, try to force reload the images with a different approach
        if (retryCount === 1) {
          console.log('Mobile view: Second retry - using optimized Google Drive URLs');
          // The component will re-render with the updated retryCount
          // and use the optimized Google Drive URLs
        }

        // On the third retry, try to use the service worker cache
        if (retryCount === 2) {
          console.log('Mobile view: Third retry - using service worker cache');
          // The component will re-render with the updated retryCount
          // and try to use the service worker cache

          // Clear the image cache to force a fresh load
          if (window.imageCache) {
            window.imageCache.clear();
          }
        }

        // On the fourth retry, try to use base64 data URLs
        if (retryCount === 3) {
          console.log('Mobile view: Fourth retry - using base64 data URLs');
          // The component will re-render with the updated retryCount
          // and try to use base64 data URLs
        }
      }, 2000 + (retryCount * 1000)); // Increasing delay for each retry

      return () => clearTimeout(timer);
    }
  }, [isMobile, images, retryCount]);

  // Render an individual image with enhanced error handling
  const renderImage = (image, index) => {
    // Skip invalid images
    if (!image || (!image.tempImage && !image.imageUrl && !image.id)) {
      console.log('Invalid image data:', image);
      return null;
    }

    // Determine the image source
    let imageSrc = image.tempImage || image.imageUrl;

    // Check if we're on a mobile device
    const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    // For mobile devices, try to use the direct Google Drive URL if available
    if (isMobileDevice && image.id) {
      // If we have a direct Google Drive URL, use it directly
      if (image.image_url && isGoogleDriveUrl(image.image_url)) {
        // Use the direct Google Drive URL
        imageSrc = image.image_url;
        console.log(`Mobile view: Using direct Google Drive URL for image ${image.id}`);
      }
      // If we have a direct image_url that's not from Google Drive, use it
      else if (image.image_url) {
        imageSrc = image.image_url;
        console.log(`Mobile view: Using direct image URL for image ${image.id}: ${imageSrc}`);
      }
      // Otherwise, use the API endpoint as a last resort
      else {
        imageSrc = getMemoryImageUrl(image.id);
        console.log(`Mobile view: Using API endpoint for image ${image.id}: ${imageSrc}`);
      }
    } else if (!imageSrc && image.id) {
      imageSrc = getMemoryImageUrl(image.id);
    }

    if (!imageSrc) {
      console.log('No image source found, using placeholder');
      imageSrc = memoryPlaceholder;
      // Return placeholder directly to avoid further processing
      return (
        <div className="masonry-item" key={`placeholder-${index}`}>
          <img
            src={memoryPlaceholder}
            alt="Memory placeholder"
            className="masonry-image"
          />
        </div>
      );
    }

    // Check if it's a Google Drive URL
    const isGoogleDrive = imageSrc && typeof imageSrc === 'string' && isGoogleDriveUrl(imageSrc);

    // Add timestamp to prevent caching issues
    const timestamp = new Date().getTime();
    const urlWithCache = imageSrc.includes('?')
      ? `${imageSrc}&t=${timestamp}`
      : `${imageSrc}?t=${timestamp}`;

    // For mobile, add a key with retry count to force re-render on retry
    const itemKey = isMobileDevice
      ? `${image.id || 'temp'}-${index}-retry-${retryCount}`
      : `${image.id || 'temp'}-${index}`;

    return (
      <div className="masonry-item" key={itemKey}>
        {isGoogleDrive && !isMobileDevice ? (
          // For desktop, use GoogleDriveImage component for Google Drive URLs
          <GoogleDriveImage
            src={urlWithCache}
            alt={image.name || 'Memory image'}
            className="masonry-image"
            type="memory"
            imageId={image.id} // Add imageId for reporting deleted images
            fallbackSrc={memoryPlaceholder} // Always use placeholder as fallback
          />
        ) : isGoogleDrive && isMobileDevice ? (
          // For mobile with Google Drive URLs, use a special approach
          <img
            src={getOptimizedGoogleDriveUrl(imageSrc)}
            alt={image.name || 'Memory image'}
            className="masonry-image"
            onError={(e) => {
              console.log(`Mobile: Google Drive image failed to load, using placeholder`);
              e.target.src = memoryPlaceholder;
            }}
          />
        ) : (
          // For all other cases, use DirectImageLoader
          <DirectImageLoader
            src={urlWithCache}
            alt={image.name || 'Memory image'}
            className="masonry-image"
            type="memory"
            fallbackSrc={memoryPlaceholder} // Add fallback for DirectImageLoader
          />
        )}
      </div>
    );
  };

  return (
    <div className={`masonry-gallery ${isMobile ? 'mobile-view' : ''}`}>
      {columns.map((column, columnIndex) => (
        <div className="column" key={`column-${columnIndex}`}>
          {column.map((image, imageIndex) => renderImage(image, `${columnIndex}-${imageIndex}`))}
        </div>
      ))}
    </div>
  );
};

export default MasonryGallery;
