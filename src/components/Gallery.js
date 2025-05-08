import React, { useState, useEffect, useRef } from 'react';
import './Gallery.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link } from 'react-router-dom';
import {
  getProfiles,
  getProfileImageUrl,
  getMemoryImages,
  uploadMultipleMemoryImages,
  getMemoryImageUrl
} from '../services/api';
import Navbardesk from './Navbar';
import { Container, Form, Button, Spinner } from 'react-bootstrap';
import { FaPlus, FaTimes, FaCloudUploadAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import Toast from './Toast';
import { profilePlaceholder, memoryPlaceholder } from '../assets/profile-placeholder';
import DirectImageLoader from './DirectImageLoader';
import GoogleDriveImage from './GoogleDriveImage';
import { isGoogleDriveUrl } from '../utils/googleDriveUtils';

const Gallery = () => {
  const { currentUser } = useAuth();
  const [isMobile, setIsMobile] = useState(false);
  const [profiles, setProfiles] = useState([]);
  const [allImages, setAllImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const fileInputRef = useRef(null);
  const dropAreaRef = useRef(null);

  // Helper function to get random size class
  const getRandomSize = () => {
    const sizes = ['size-small', 'size-medium', 'size-large'];
    return sizes[Math.floor(Math.random() * sizes.length)];
  };

  // Helper function to get random rotation class
  const getRandomRotation = () => {
    const rotations = ['', 'rotate-left', 'rotate-right'];
    return rotations[Math.floor(Math.random() * rotations.length)];
  };

  // Toggle upload modal
  const toggleUploadModal = () => {
    setShowUploadModal(!showUploadModal);
    if (!showUploadModal) {
      // Reset state when opening modal
      setSelectedFiles([]);
      setPreviewUrls([]);
      setUploadError(null);
    }
  };

  // Handle file selection from input
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      processFiles(files);
    }
  };

  // Process multiple selected files
  const processFiles = (files) => {
    setUploadError(null);
    const validFiles = [];
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes

    // Validate each file
    for (const file of files) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setUploadError('Please select only image files (JPG, PNG, GIF)');
        return;
      }

      // Validate file size
      if (file.size > maxSize) {
        setUploadError(`File "${file.name}" is too large. Maximum size is 5MB.`);
        return;
      }

      validFiles.push(file);
    }

    // If we have valid files, update state
    if (validFiles.length > 0) {
      setSelectedFiles(validFiles);

      // Create preview URLs for all files
      const newPreviewUrls = [];

      validFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviewUrls.push(reader.result);
          // When all files are processed, update state
          if (newPreviewUrls.length === validFiles.length) {
            setPreviewUrls(newPreviewUrls);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // Handle drag events
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Only set dragging to false if we're leaving the drop area itself, not its children
    if (e.currentTarget === e.target) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      processFiles(files);
    }
  };

  // Handle file upload - now actually uploads to the database
  const handleUpload = async (e) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      setUploadError('Please select at least one image to upload');
      return;
    }

    setUploading(true);
    setUploadError(null);

    // Show initial progress message
    setToastMessage(`Starting upload of ${selectedFiles.length} image${selectedFiles.length !== 1 ? 's' : ''}...`);
    setToastType('info');
    setShowToast(true);

    try {
      // Add the user's email to identify who uploaded the images
      const uploadedBy = currentUser?.email || 'anonymous';

      // For larger batches, show a progress message
      if (selectedFiles.length > 3) {
        setToastMessage(`Uploading ${selectedFiles.length} images one by one. This may take a while...`);
        setToastType('info');
        setShowToast(true);
      }

      // Upload the images to the server
      const uploadedImages = await uploadMultipleMemoryImages(selectedFiles, uploadedBy);

      // Check if we got any successful uploads
      if (!uploadedImages || uploadedImages.length === 0) {
        throw new Error('No images were uploaded successfully');
      }

      // Create temporary objects for immediate display
      const newImages = uploadedImages.map((image, index) => ({
        id: image.id,
        name: image.name || `Memory ${index + 1}`,
        type: 'memory',
        imageUrl: image.image_url || getMemoryImageUrl(image.id),
        approved: true // Images are now automatically approved
      }));

      // Add the new images to allImages
      setAllImages(prevImages => [...newImages, ...prevImages]);

      // Close the modal and reset state
      setShowUploadModal(false);
      setSelectedFiles([]);
      setPreviewUrls([]);

      // Show success message
      setToastMessage(`Successfully uploaded ${uploadedImages.length} image${uploadedImages.length !== 1 ? 's' : ''}! Your image${uploadedImages.length !== 1 ? 's are' : ' is'} now visible in Memory Lane. The page will reload shortly.`);
      setToastType('success');
      setShowToast(true);

      // Set a timeout to reload the page after showing the success message
      setTimeout(() => {
        window.location.reload();
      }, 3000); // Reload after 3 seconds to give the user time to see the success message
    } catch (error) {
      console.error('Error uploading images:', error);

      // Provide more specific error messages based on the error type
      let errorMessage = 'There was an issue uploading your images. Please check your connection and try again.';

      if (error.code === 'ECONNABORTED') {
        errorMessage = 'The upload timed out. Please try uploading fewer images at once or check your connection.';
      } else if (error.response && error.response.status === 413) {
        errorMessage = 'The images are too large. Please reduce their size or upload fewer images at once.';
      } else if (error.message && error.message.includes('Network Error')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      }

      setUploadError(errorMessage);

      // Show error message using toast
      setToastMessage(errorMessage);
      setToastType('error');
      setShowToast(true);
    } finally {
      setUploading(false);
    }
  };

  // Check if user is admin
  const isAdmin = currentUser && currentUser.email &&
    (currentUser.email === 'admin@iitgn.ac.in' ||
     currentUser.email === 'yearbook@iitgn.ac.in' ||
     currentUser.email === 'maprc@iitgn.ac.in' ||
     currentUser.email === 'jayraj.jayraj@iitgn.ac.in');

  // Effect to handle screen size changes and fetch data
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch both profiles and memory images in parallel
        const [profilesData, memoryImagesData] = await Promise.all([
          getProfiles(),
          getMemoryImages() // No need for admin parameter anymore
        ]);

        setProfiles(profilesData);

        // Combine profile images and memory images into a single array for display
        const profileImages = profilesData.map(profile => ({
          id: profile.id,
          name: profile.name,
          type: 'profile',
          imageUrl: getProfileImageUrl(profile.id)
        }));

        const memoryImgs = memoryImagesData.map(memory => ({
          id: memory.id,
          name: memory.name || 'Memory Image',
          type: 'memory',
          // Use the direct URL from Google Drive if available, otherwise use the API endpoint
          imageUrl: memory.image_url || memory.imageUrl || getMemoryImageUrl(memory.id)
        }));

        // Combine and shuffle all images
        setAllImages([...profileImages, ...memoryImgs].sort(() => 0.5 - Math.random()));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    checkScreenSize();
    fetchData();
    window.addEventListener('resize', checkScreenSize);

    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  // No animation delay - we've removed the need for this
  // Animation starts immediately via CSS

  // Function to split images into rows for the memory wall
  const splitImages = (images) => {
    const minItemsPerRow = 8; // Ensure we have enough items for continuous flow

    if (images.length < minItemsPerRow) {
      // If we have fewer images than needed, duplicate them to fill each row
      const duplicated = [];
      while (duplicated.length < minItemsPerRow) {
        duplicated.push(...images);
      }
      // Create 4 rows with different shuffles of the duplicated images
      return [
        [...duplicated].sort(() => 0.5 - Math.random()).slice(0, minItemsPerRow),
        [...duplicated].sort(() => 0.5 - Math.random()).slice(0, minItemsPerRow),
        [...duplicated].sort(() => 0.5 - Math.random()).slice(0, minItemsPerRow),
        [...duplicated].sort(() => 0.5 - Math.random()).slice(0, minItemsPerRow)
      ];
    }

    // Shuffle the images for more randomness
    const shuffled = [...images].sort(() => 0.5 - Math.random());

    // Create 4 rows with different images
    const rowCount = 4;
    const rows = [];

    for (let i = 0; i < rowCount; i++) {
      // Create a different starting point for each row
      const startIndex = Math.floor((i * shuffled.length) / rowCount) % shuffled.length;
      const rowImages = [];

      // Get images for this row, wrapping around if needed
      // Ensure we have at least minItemsPerRow items
      const itemCount = Math.max(minItemsPerRow, shuffled.length);
      for (let j = 0; j < itemCount; j++) {
        const index = (startIndex + j) % shuffled.length;
        rowImages.push(shuffled[index]);
      }

      // Shuffle each row for more randomness
      rows.push(rowImages.sort(() => 0.5 - Math.random()));
    }

    return rows;
  };

  if (loading) return (
    <>
      {!isMobile && <Navbardesk />}
      <div className="gallery-container">
        <div className="loading-container">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading memories...</p>
        </div>
      </div>
      {isMobile && <Navbardesk />}
    </>
  );



  // Function to render a memory item
  const renderMemoryItem = (image, index, preserveSize = false) => {
    // Only apply random size if not preserving original size
    const sizeClass = preserveSize ? 'preserve-size' : getRandomSize();
    const rotationClass = getRandomRotation();

    // Skip rendering if we don't have a valid image
    if (!image || (!image.tempImage && !image.imageUrl && !image.id)) {
      console.log('Invalid memory image data:', image);
      return (
        <div
          className={`memory-item ${sizeClass} ${rotationClass}`}
          key={`placeholder-${index}`}
        >
          <DirectImageLoader
            src={memoryPlaceholder}
            alt="Memory placeholder"
            className="memory-image"
            type="memory"
          />
        </div>
      );
    }

    // Determine the image source based on the image object structure
    let imageSrc;

    // If we have a temporary image (from a recent upload), use that
    if (image.tempImage) {
      imageSrc = image.tempImage;
    }
    // Otherwise, if we have a direct URL, use that
    else if (image.imageUrl) {
      imageSrc = image.imageUrl;
    }
    // Otherwise, use the API endpoint
    else if (image.id) {
      imageSrc = getMemoryImageUrl(image.id);
    }
    // If all else fails, use the placeholder
    else {
      imageSrc = memoryPlaceholder;
    }

    // Check if it's a Google Drive URL
    const isGoogleDrive = imageSrc && typeof imageSrc === 'string' && isGoogleDriveUrl(imageSrc);

    return (
      <div
        className={`memory-item ${sizeClass} ${rotationClass}`}
        key={`${image.id || 'temp'}-${index}`}
      >
        {isGoogleDrive ? (
          <GoogleDriveImage
            src={imageSrc}
            alt={image.name || 'Memory image'}
            className="memory-image"
            type="memory"
            fallbackSrc={image.id ? getMemoryImageUrl(image.id) : memoryPlaceholder}
          />
        ) : (
          <DirectImageLoader
            src={imageSrc}
            alt={image.name || 'Memory image'}
            className="memory-image"
            type="memory"
          />
        )}
      </div>
    );
  };

  // Function to determine if an image should preserve its original size
  const shouldPreserveSize = () => {
    // Increased probability to preserve original size
    // In a real app, you might base this on actual image dimensions
    return Math.random() > 0.4; // 60% chance to preserve original size
  };

  // Function to create duplicate items for seamless looping
  const createDuplicateItems = (items) => {
    // Create multiple copies to ensure we have enough for infinite scrolling
    // This ensures the animation appears continuous and creates a perfect loop
    // We need at least 3 complete sets for a seamless loop
    return [...items, ...items, ...items, ...items, ...items, ...items];
  };

  // Function to render the memory wall - animation starts immediately from center
  const renderMemoryWall = () => {
    const rows = splitImages(allImages);

    return (
      <div className="memory-wall">
        {rows.map((rowImages, rowIndex) => {
          // Create duplicates for seamless looping
          const duplicatedImages = createDuplicateItems(rowImages);

          return (
            <div className="memory-row" key={`row-${rowIndex}`}>
              <div className="track-container">
                <div className="memory-track">
                  {duplicatedImages.map((image, index) => {
                    const preserveSize = shouldPreserveSize();
                    return renderMemoryItem(image, `${rowIndex}-${index}`, preserveSize);
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Render upload modal
  const renderUploadModal = () => {
    return (
      <div className={`upload-modal-overlay ${showUploadModal ? 'active' : ''}`}>
        <div className="upload-modal-container">
          <button className="close-modal-btn" onClick={toggleUploadModal}>
            <FaTimes />
          </button>
          <h3 className="upload-modal-title">Add a Memory</h3>

          <Form onSubmit={handleUpload}>
            <div
              className={`upload-preview ${isDragging ? 'dragging' : ''}`}
              ref={dropAreaRef}
              onClick={() => fileInputRef.current.click()}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {previewUrls.length > 0 ? (
                <div className="preview-gallery">
                  {previewUrls.map((url, index) => (
                    <div className="preview-item" key={index}>
                      <img src={url} alt={`Preview ${index + 1}`} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="upload-placeholder">
                  <FaCloudUploadAlt size={50} />
                  <p>{isDragging ? 'Drop images here' : 'Click or drag images here'}</p>
                  <div className="upload-instructions">
                    Supported formats: JPG, PNG, GIF<br />
                    Max size: 5MB per image<br />
                    Select multiple files at once
                  </div>
                </div>
              )}
            </div>

            <div className="file-input-container">
              <input
                type="file"
                accept="image/*"
                multiple
                className="file-input"
                onChange={handleFileChange}
                ref={fileInputRef}
              />
              <Button
                variant="outline-secondary"
                className="w-100"
                onClick={() => fileInputRef.current.click()}
              >
                {previewUrls.length > 0 ? `Change Images (${previewUrls.length} selected)` : 'Select Images'}
              </Button>
            </div>

            {uploadError && (
              <div className="upload-error">
                <strong>Error:</strong> {uploadError}
              </div>
            )}

            <Button
              type="submit"
              className="upload-btn"
              disabled={selectedFiles.length === 0 || uploading}
            >
              {uploading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Uploading {selectedFiles.length > 1 ? `${selectedFiles.length} images` : 'image'}...
                </>
              ) : (
                `Upload ${selectedFiles.length > 0 ? selectedFiles.length : ''} ${selectedFiles.length === 1 ? 'Memory' : 'Memories'}`
              )}
            </Button>
          </Form>
        </div>
      </div>
    );
  };

  return (
    <>
      {!isMobile && <Navbardesk />}
      <div className="gallery-container">
        {/* Toast notification */}
        <Toast
          show={showToast}
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
          position="top-center"
        />

        <Container>
          <div className="gallery-header">
            <Link to="/" className="back-button">
              <i className="fas fa-arrow-left"></i> Back
            </Link>
            <h1 className="gallery-title">Memory Lane</h1>
            <p className="messages-subtitle">A nostalgic journey through your best moments together</p>
          </div>
          <div className="gallery-content">
            {allImages.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <i className="fas fa-images"></i>
                </div>
                <h3>No memories yet</h3>
                <p>Upload photos or create your profile to add to the memory lane</p>
                <div className="d-flex gap-3 justify-content-center">
                  <button
                    className="btn btn-primary mt-3"
                    onClick={toggleUploadModal}
                  >
                    <i className="fas fa-upload me-2"></i> Upload Photos
                  </button>
                  <Link to="/build-profile" className="btn btn-outline-primary mt-3">
                    <i className="fas fa-plus-circle me-2"></i> Build Your Profile
                  </Link>
                </div>
              </div>
            ) : (
              <>
                {/* Floating memory wall */}
                {renderMemoryWall()}

                {/* Original grid (hidden with CSS) */}
                <div className="gallery-grid">
                  {profiles.map((profile) => (
                    <div className="gallery-item" key={profile.id}>
                      {profile.image_url && isGoogleDriveUrl(profile.image_url) ? (
                        <GoogleDriveImage
                          src={profile.image_url}
                          alt={profile.name}
                          className="gallery-image"
                          type="profile"
                          fallbackSrc={getProfileImageUrl(profile.id)}
                        />
                      ) : (
                        <DirectImageLoader
                          src={profile.tempImage || profile.image_url || getProfileImageUrl(profile.id)}
                          alt={profile.name}
                          className="gallery-image"
                          type="profile"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </Container>

        {/* Upload button */}
        <button className="upload-memory-btn" onClick={toggleUploadModal}>
          <FaPlus />
        </button>

        {/* Upload modal */}
        {renderUploadModal()}
      </div>
      {isMobile && <Navbardesk />}
    </>
  );
};

export default Gallery;
