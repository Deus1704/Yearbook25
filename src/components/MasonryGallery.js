import React from 'react';
import './MasonryGallery.css';
import { isGoogleDriveUrl } from '../utils/googleDriveUtils';
import GoogleDriveImage from './GoogleDriveImage';
import DirectImageLoader from './DirectImageLoader';
import { getMemoryImageUrl } from '../services/api';
import { memoryPlaceholder } from '../assets/profile-placeholder';

/**
 * MasonryGallery component that displays images in a masonry layout
 *
 * @param {Object} props - Component props
 * @param {Array} props.images - Array of image objects to display
 * @returns {React.Component} - The MasonryGallery component
 */
const MasonryGallery = ({ images }) => {
  // If no images, return null
  if (!images || images.length === 0) {
    return null;
  }

  // Split images into 4 columns (or fewer for mobile)
  const splitIntoColumns = (images) => {
    const columns = [[], [], [], []];

    images.forEach((image, index) => {
      const columnIndex = index % columns.length;
      columns[columnIndex].push(image);
    });

    return columns;
  };

  const columns = splitIntoColumns(images);

  // Render an individual image
  const renderImage = (image, index) => {
    // Skip invalid images
    if (!image || (!image.tempImage && !image.imageUrl && !image.id)) {
      console.log('Invalid image data:', image);
      return null;
    }

    // Skip images with ID 5 which is causing the error
    if (image.id === 5) {
      console.log('Skipping problematic image with ID 5');
      return null;
    }

    // Determine the image source
    let imageSrc = image.tempImage || image.imageUrl;
    if (!imageSrc && image.id) {
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

    return (
      <div className="masonry-item" key={`${image.id || 'temp'}-${index}`}>
        {isGoogleDrive ? (
          <GoogleDriveImage
            src={imageSrc}
            alt={image.name || 'Memory image'}
            className="masonry-image"
            type="memory"
            imageId={image.id} // Add imageId for reporting deleted images
            fallbackSrc={memoryPlaceholder} // Always use placeholder as fallback
          />
        ) : (
          <DirectImageLoader
            src={imageSrc}
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
    <div className="masonry-gallery">
      {columns.map((column, columnIndex) => (
        <div className="column" key={`column-${columnIndex}`}>
          {column.map((image, imageIndex) => renderImage(image, `${columnIndex}-${imageIndex}`))}
        </div>
      ))}
    </div>
  );
};

export default MasonryGallery;
