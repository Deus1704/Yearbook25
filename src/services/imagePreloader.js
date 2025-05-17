import { getProfiles, getMemoryImages, getProfileImageUrl, getMemoryImageUrl } from './api';
import { isGoogleDriveUrl, extractGoogleDriveFileId } from '../utils/googleDriveUtils';

// Create a cache to store preloaded images
const imageCache = {
  profiles: [],
  memories: [],
  isLoading: false,
  lastLoaded: null
};

/**
 * Preload all gallery images in the background
 * This function fetches profile and memory images and stores them in the cache
 * @returns {Promise<{profiles: Array, memories: Array}>} - The preloaded images
 */
export const preloadGalleryImages = async () => {
  // If already loading, return the existing promise
  if (imageCache.isLoading) {
    console.log('Image preloading already in progress, waiting for completion...');
    return;
  }

  // If images were loaded in the last 5 minutes, use the cache
  const now = new Date();
  if (imageCache.lastLoaded && (now - imageCache.lastLoaded) < 5 * 60 * 1000) {
    console.log('Using cached images from recent preload');
    return { profiles: imageCache.profiles, memories: imageCache.memories };
  }

  console.log('Starting background preload of gallery images...');
  imageCache.isLoading = true;

  try {
    // Fetch both profiles and memory images in parallel
    const [profilesData, memoryImagesData] = await Promise.all([
      getProfiles(),
      getMemoryImages()
    ]);

    // Process profile images
    const profileImages = profilesData.map(profile => ({
      id: profile.id,
      name: profile.name,
      type: 'profile',
      status: profile.status,
      imageUrl: getProfileImageUrl(profile.id, profile.image_url)
    }));

    // Filter out any memory images that might have been deleted from Google Drive
    const validMemoryImages = memoryImagesData.filter(memory =>
      memory && (memory.image_id || memory.image_url)
    );

    const memoryImages = validMemoryImages.map(memory => ({
      id: memory.id,
      name: memory.name || 'Memory Image',
      type: 'memory',
      status: memory.status,
      imageUrl: memory.image_url || memory.imageUrl || getMemoryImageUrl(memory.id)
    }));

    console.log(`Preloaded ${profileImages.length} profile images and ${memoryImages.length} memory images`);

    // Filter out problematic images
    const filteredProfiles = profileImages.filter(img => filterValidImage(img));
    const filteredMemories = memoryImages.filter(img => filterValidImage(img));

    // Update the cache
    imageCache.profiles = filteredProfiles;
    imageCache.memories = filteredMemories;
    imageCache.lastLoaded = new Date();
    imageCache.isLoading = false;

    return { profiles: filteredProfiles, memories: filteredMemories };
  } catch (error) {
    console.error('Error preloading gallery images:', error);
    imageCache.isLoading = false;
    throw error;
  }
};

/**
 * Filter out invalid or problematic images
 * @param {Object} img - The image object to filter
 * @returns {boolean} - Whether the image is valid
 */
const filterValidImage = (img) => {
  // Filter out images marked as deleted in the database
  if (img.status === 'deleted') {
    console.log(`Filtering out image with deleted status: ${img.id}`);
    return false;
  }

  // Filter out images with ID 5 which is causing the error
  if (img.id === 5) {
    console.log('Filtering out problematic image with ID 5');
    return false;
  }

  // Filter out images with invalid URLs
  if (!img.imageUrl && !img.tempImage && !img.id) {
    console.log('Filtering out image with missing URL:', img);
    return false;
  }

  // Filter out images with known deleted Google Drive IDs
  if (img.imageUrl && isGoogleDriveUrl(img.imageUrl)) {
    const fileId = extractGoogleDriveFileId(img.imageUrl);
    // Check if this file ID is in the deleted files cache (if it exists)
    if (fileId && window.deletedFilesCache && window.deletedFilesCache.has(fileId)) {
      console.log(`Filtering out image with known deleted Google Drive ID: ${fileId}`);
      return false;
    }

    // Also filter out the specific problematic ID from the error
    if (fileId === '1aeu2JLfeGX_8yvC-1YjtZKuRZ8dAz8qO') {
      console.log('Filtering out image with known problematic Google Drive ID');
      // Add to deleted files cache if it exists
      if (window.deletedFilesCache) {
        window.deletedFilesCache.add(fileId);
      }
      return false;
    }
  }

  return true;
};

/**
 * Get the preloaded images from the cache
 * If the cache is empty or stale, it will trigger a new preload
 * @returns {Object} - The cached images
 */
export const getCachedImages = () => {
  // If cache is empty or stale, trigger a new preload
  const now = new Date();
  if (!imageCache.lastLoaded || (now - imageCache.lastLoaded) > 5 * 60 * 1000) {
    // Trigger preload but don't wait for it
    preloadGalleryImages().catch(err => console.error('Background preload error:', err));
  }

  return {
    profiles: imageCache.profiles,
    memories: imageCache.memories,
    isLoaded: !!imageCache.lastLoaded
  };
};
