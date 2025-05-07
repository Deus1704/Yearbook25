const googleDrive = require('./googleDrive');
const path = require('path');
require('dotenv').config();

// Folder IDs for different file types
let profilesFolderId;
let memoriesFolderId;

/**
 * Initialize the file storage service
 * Creates the necessary folders in Google Drive
 */
async function initFileStorage() {
  try {
    // Initialize Google Drive
    await googleDrive.initGoogleDrive();

    // Get or create the profiles folder
    const profilesFolder = await googleDrive.createFolder('Profiles');
    profilesFolderId = profilesFolder.id;
    console.log(`Profiles folder ID: ${profilesFolderId}`);

    // Get or create the memories folder
    const memoriesFolder = await googleDrive.createFolder('Memories');
    memoriesFolderId = memoriesFolder.id;
    console.log(`Memories folder ID: ${memoriesFolderId}`);

    return true;
  } catch (error) {
    console.error('Error initializing file storage:', error.message);
    throw error;
  }
}

/**
 * Upload a profile image to Google Drive
 * @param {Buffer} imageBuffer - The image buffer to upload
 * @param {string} userId - The user ID to associate with the image
 * @returns {Promise<Object>} - The uploaded image metadata
 */
async function uploadProfileImage(imageBuffer, userId) {
  try {
    const fileName = `profile_${userId}_${Date.now()}.jpg`;
    const mimeType = 'image/jpeg';

    const file = await googleDrive.uploadFile(
      imageBuffer,
      fileName,
      mimeType,
      profilesFolderId
    );

    return {
      fileId: file.id,
      fileName: file.name,
      webViewLink: file.webViewLink,
      webContentLink: file.webContentLink,
    };
  } catch (error) {
    console.error('Error uploading profile image:', error.message);
    throw error;
  }
}

/**
 * Get a profile image from Google Drive
 * @param {string} fileId - The ID of the image to get
 * @returns {Promise<Object>} - The image metadata and content
 */
async function getProfileImage(fileId) {
  try {
    return await googleDrive.getFile(fileId);
  } catch (error) {
    console.error('Error getting profile image:', error.message);
    throw error;
  }
}

/**
 * Upload a memory image to Google Drive
 * @param {Buffer} imageBuffer - The image buffer to upload
 * @param {string} name - The name of the memory
 * @returns {Promise<Object>} - The uploaded image metadata
 */
async function uploadMemoryImage(imageBuffer, name) {
  try {
    const fileName = `memory_${name.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.jpg`;
    const mimeType = 'image/jpeg';

    const file = await googleDrive.uploadFile(
      imageBuffer,
      fileName,
      mimeType,
      memoriesFolderId
    );

    return {
      fileId: file.id,
      fileName: file.name,
      webViewLink: file.webViewLink,
      webContentLink: file.webContentLink,
    };
  } catch (error) {
    console.error('Error uploading memory image:', error.message);
    throw error;
  }
}

/**
 * Get a memory image from Google Drive
 * @param {string} fileId - The ID of the image to get
 * @returns {Promise<Object>} - The image metadata and content
 */
async function getMemoryImage(fileId) {
  try {
    return await googleDrive.getFile(fileId);
  } catch (error) {
    console.error('Error getting memory image:', error.message);
    throw error;
  }
}

/**
 * Update a profile image in Google Drive
 * @param {string} fileId - The ID of the file to update
 * @param {Buffer} imageBuffer - The new image buffer
 * @returns {Promise<Object>} - The updated image metadata
 */
async function updateProfileImage(fileId, imageBuffer) {
  try {
    // Delete the old file
    await googleDrive.deleteFile(fileId);

    // Upload the new file with the same name pattern but updated timestamp
    const fileName = `profile_updated_${Date.now()}.jpg`;
    const mimeType = 'image/jpeg';

    const file = await googleDrive.uploadFile(
      imageBuffer,
      fileName,
      mimeType,
      profilesFolderId
    );

    return {
      fileId: file.id,
      fileName: file.name,
      webViewLink: file.webViewLink,
      webContentLink: file.webContentLink,
    };
  } catch (error) {
    console.error('Error updating profile image:', error.message);
    throw error;
  }
}

/**
 * Delete a file from Google Drive
 * @param {string} fileId - The ID of the file to delete
 * @returns {Promise<boolean>} - True if the file was deleted successfully
 */
async function deleteFile(fileId) {
  try {
    return await googleDrive.deleteFile(fileId);
  } catch (error) {
    console.error('Error deleting file:', error.message);
    throw error;
  }
}

/**
 * List all profile images
 * @returns {Promise<Array>} - The list of profile images
 */
async function listProfileImages() {
  try {
    return await googleDrive.listFiles(profilesFolderId);
  } catch (error) {
    console.error('Error listing profile images:', error.message);
    throw error;
  }
}

/**
 * List all memory images
 * @returns {Promise<Array>} - The list of memory images
 */
async function listMemoryImages() {
  try {
    return await googleDrive.listFiles(memoriesFolderId);
  } catch (error) {
    console.error('Error listing memory images:', error.message);
    throw error;
  }
}

module.exports = {
  initFileStorage,
  uploadProfileImage,
  getProfileImage,
  updateProfileImage,
  uploadMemoryImage,
  getMemoryImage,
  deleteFile,
  listProfileImages,
  listMemoryImages,
};
