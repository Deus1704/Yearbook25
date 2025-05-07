/**
 * File Storage Service with Mock Support
 *
 * This service provides file storage functionality using Google Drive
 * with a fallback to a mock implementation for testing.
 */

const googleDrive = require('./googleDrive');
const path = require('path');
const crypto = require('crypto');
require('dotenv').config();

// Folder IDs for different file types
let profilesFolderId;
let memoriesFolderId;

// Mock storage for testing
const mockStorage = {
  files: new Map(),
  folders: new Map(),
  initialized: false
};

// Check if we should use mock storage
const useMock = process.env.USE_MOCK_STORAGE === 'true';

/**
 * Initialize the mock storage
 */
function initMockStorage() {
  if (mockStorage.initialized) {
    return;
  }

  console.log('Initializing mock storage...');

  // Create root folder
  mockStorage.folders.set('root', {
    id: 'root',
    name: 'Root',
    files: [],
    folders: []
  });

  // Create profiles folder
  profilesFolderId = 'folder_profiles_' + crypto.randomBytes(4).toString('hex');
  mockStorage.folders.set(profilesFolderId, {
    id: profilesFolderId,
    name: 'Profiles',
    files: [],
    folders: [],
    parent: 'root'
  });

  // Create memories folder
  memoriesFolderId = 'folder_memories_' + crypto.randomBytes(4).toString('hex');
  mockStorage.folders.set(memoriesFolderId, {
    id: memoriesFolderId,
    name: 'Memories',
    files: [],
    folders: [],
    parent: 'root'
  });

  mockStorage.initialized = true;
  console.log('Mock storage initialized');
  console.log(`Profiles folder ID: ${profilesFolderId}`);
  console.log(`Memories folder ID: ${memoriesFolderId}`);
}

/**
 * Upload a file to mock storage
 */
function mockUploadFile(buffer, fileName, mimeType, folderId) {
  const id = 'file_' + crypto.randomBytes(8).toString('hex');

  const file = {
    id,
    name: fileName,
    mimeType,
    content: buffer,
    size: buffer.length,
    parent: folderId,
    webViewLink: `https://mock-drive.example.com/view/${id}`,
    webContentLink: `https://mock-drive.example.com/download/${id}`,
    createdAt: new Date().toISOString()
  };

  mockStorage.files.set(id, file);

  // Add to parent folder
  if (folderId && mockStorage.folders.has(folderId)) {
    const folder = mockStorage.folders.get(folderId);
    folder.files.push(id);
  }

  console.log(`[MOCK] Uploaded file: ${fileName} (${id})`);
  return {
    id,
    name: fileName,
    webViewLink: file.webViewLink,
    webContentLink: file.webContentLink
  };
}

/**
 * Get a file from mock storage
 */
function mockGetFile(fileId) {
  if (!mockStorage.files.has(fileId)) {
    throw new Error(`[MOCK] File not found: ${fileId}`);
  }

  const file = mockStorage.files.get(fileId);

  console.log(`[MOCK] Retrieved file: ${file.name} (${fileId})`);
  return {
    metadata: {
      id: file.id,
      name: file.name,
      mimeType: file.mimeType,
      webViewLink: file.webViewLink,
      webContentLink: file.webContentLink
    },
    content: file.content
  };
}

/**
 * Delete a file from mock storage
 */
function mockDeleteFile(fileId) {
  if (!mockStorage.files.has(fileId)) {
    throw new Error(`[MOCK] File not found: ${fileId}`);
  }

  const file = mockStorage.files.get(fileId);

  // Remove from parent folder
  if (file.parent && mockStorage.folders.has(file.parent)) {
    const folder = mockStorage.folders.get(file.parent);
    folder.files = folder.files.filter(id => id !== fileId);
  }

  // Delete the file
  mockStorage.files.delete(fileId);

  console.log(`[MOCK] Deleted file: ${file.name} (${fileId})`);
  return true;
}

/**
 * List files in a folder from mock storage
 */
function mockListFiles(folderId) {
  if (!mockStorage.folders.has(folderId)) {
    throw new Error(`[MOCK] Folder not found: ${folderId}`);
  }

  const folder = mockStorage.folders.get(folderId);
  const files = folder.files.map(id => {
    const file = mockStorage.files.get(id);
    return {
      id: file.id,
      name: file.name,
      mimeType: file.mimeType,
      webViewLink: file.webViewLink,
      webContentLink: file.webContentLink
    };
  });

  console.log(`[MOCK] Listed ${files.length} files in folder: ${folder.name} (${folderId})`);
  return files;
}

/**
 * Initialize the file storage service
 * Creates the necessary folders in Google Drive
 */
async function initFileStorage() {
  try {
    if (useMock) {
      initMockStorage();
      return true;
    }

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
    console.log('Falling back to mock storage...');

    // Fall back to mock storage
    initMockStorage();
    return true;
  }
}

/**
 * Upload a profile image
 * @param {Buffer} imageBuffer - The image buffer to upload
 * @param {string} userId - The user ID to associate with the image
 * @returns {Promise<Object>} - The uploaded image metadata
 */
async function uploadProfileImage(imageBuffer, userId) {
  try {
    const fileName = `profile_${userId}_${Date.now()}.jpg`;
    const mimeType = 'image/jpeg';

    if (useMock) {
      return mockUploadFile(imageBuffer, fileName, mimeType, profilesFolderId);
    }

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

    if (!useMock) {
      console.log('Falling back to mock storage...');
      const fileName = `profile_${userId}_${Date.now()}.jpg`;
      const mimeType = 'image/jpeg';
      return mockUploadFile(imageBuffer, fileName, mimeType, profilesFolderId);
    }

    throw error;
  }
}

/**
 * Get a profile image
 * @param {string} fileId - The ID of the image to get
 * @returns {Promise<Object>} - The image metadata and content
 */
async function getProfileImage(fileId) {
  try {
    if (useMock || mockStorage.files.has(fileId)) {
      return mockGetFile(fileId);
    }

    return await googleDrive.getFile(fileId);
  } catch (error) {
    console.error('Error getting profile image:', error.message);

    if (mockStorage.files.has(fileId)) {
      console.log('Falling back to mock storage...');
      return mockGetFile(fileId);
    }

    throw error;
  }
}

/**
 * Upload a memory image
 * @param {Buffer} imageBuffer - The image buffer to upload
 * @param {string} name - The name of the memory
 * @returns {Promise<Object>} - The uploaded image metadata
 */
async function uploadMemoryImage(imageBuffer, name) {
  try {
    const fileName = `memory_${name.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.jpg`;
    const mimeType = 'image/jpeg';

    if (useMock) {
      return mockUploadFile(imageBuffer, fileName, mimeType, memoriesFolderId);
    }

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

    if (!useMock) {
      console.log('Falling back to mock storage...');
      const fileName = `memory_${name.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.jpg`;
      const mimeType = 'image/jpeg';
      return mockUploadFile(imageBuffer, fileName, mimeType, memoriesFolderId);
    }

    throw error;
  }
}

/**
 * Get a memory image
 * @param {string} fileId - The ID of the image to get
 * @returns {Promise<Object>} - The image metadata and content
 */
async function getMemoryImage(fileId) {
  try {
    if (useMock || mockStorage.files.has(fileId)) {
      return mockGetFile(fileId);
    }

    return await googleDrive.getFile(fileId);
  } catch (error) {
    console.error('Error getting memory image:', error.message);

    if (mockStorage.files.has(fileId)) {
      console.log('Falling back to mock storage...');
      return mockGetFile(fileId);
    }

    throw error;
  }
}

/**
 * Delete a file
 * @param {string} fileId - The ID of the file to delete
 * @returns {Promise<boolean>} - True if the file was deleted successfully
 */
async function deleteFile(fileId) {
  try {
    if (useMock || mockStorage.files.has(fileId)) {
      return mockDeleteFile(fileId);
    }

    return await googleDrive.deleteFile(fileId);
  } catch (error) {
    console.error('Error deleting file:', error.message);

    if (mockStorage.files.has(fileId)) {
      console.log('Falling back to mock storage...');
      return mockDeleteFile(fileId);
    }

    throw error;
  }
}

/**
 * List all profile images
 * @returns {Promise<Array>} - The list of profile images
 */
async function listProfileImages() {
  try {
    if (useMock) {
      return mockListFiles(profilesFolderId);
    }

    return await googleDrive.listFiles(profilesFolderId);
  } catch (error) {
    console.error('Error listing profile images:', error.message);

    if (!useMock) {
      console.log('Falling back to mock storage...');
      return mockListFiles(profilesFolderId);
    }

    throw error;
  }
}

/**
 * List all memory images
 * @returns {Promise<Array>} - The list of memory images
 */
async function listMemoryImages() {
  try {
    if (useMock) {
      return mockListFiles(memoriesFolderId);
    }

    return await googleDrive.listFiles(memoriesFolderId);
  } catch (error) {
    console.error('Error listing memory images:', error.message);

    if (!useMock) {
      console.log('Falling back to mock storage...');
      return mockListFiles(memoriesFolderId);
    }

    throw error;
  }
}

module.exports = {
  initFileStorage,
  uploadProfileImage,
  getProfileImage,
  uploadMemoryImage,
  getMemoryImage,
  deleteFile,
  listProfileImages,
  listMemoryImages,
};
