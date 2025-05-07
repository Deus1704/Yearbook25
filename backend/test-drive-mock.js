/**
 * Mock test script for Google Drive integration
 * 
 * This script simulates the Google Drive integration without actually
 * connecting to Google Drive. It's useful for testing the application
 * logic without requiring valid Google Drive credentials.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Mock Google Drive service
class MockGoogleDrive {
  constructor() {
    this.files = new Map();
    this.folders = new Map();
    
    // Create root folder
    this.folders.set('root', {
      id: 'root',
      name: 'Root',
      files: [],
      folders: []
    });
    
    console.log('Mock Google Drive service initialized');
  }
  
  // Create a folder
  createFolder(name, parentId = 'root') {
    const id = 'folder_' + crypto.randomBytes(8).toString('hex');
    
    const folder = {
      id,
      name,
      files: [],
      folders: [],
      parent: parentId,
      webViewLink: `https://mock-drive.example.com/folders/${id}`,
      createdAt: new Date().toISOString()
    };
    
    this.folders.set(id, folder);
    
    // Add to parent folder
    if (parentId && this.folders.has(parentId)) {
      const parent = this.folders.get(parentId);
      parent.folders.push(id);
    }
    
    console.log(`Created folder: ${name} (${id})`);
    return { id, name, webViewLink: folder.webViewLink };
  }
  
  // Upload a file
  uploadFile(buffer, fileName, mimeType, folderId = 'root') {
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
    
    this.files.set(id, file);
    
    // Add to parent folder
    if (folderId && this.folders.has(folderId)) {
      const folder = this.folders.get(folderId);
      folder.files.push(id);
    }
    
    console.log(`Uploaded file: ${fileName} (${id})`);
    return {
      id,
      name: fileName,
      webViewLink: file.webViewLink,
      webContentLink: file.webContentLink
    };
  }
  
  // Get a file
  getFile(fileId) {
    if (!this.files.has(fileId)) {
      throw new Error(`File not found: ${fileId}`);
    }
    
    const file = this.files.get(fileId);
    
    console.log(`Retrieved file: ${file.name} (${fileId})`);
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
  
  // Delete a file
  deleteFile(fileId) {
    if (!this.files.has(fileId)) {
      throw new Error(`File not found: ${fileId}`);
    }
    
    const file = this.files.get(fileId);
    
    // Remove from parent folder
    if (file.parent && this.folders.has(file.parent)) {
      const folder = this.folders.get(file.parent);
      folder.files = folder.files.filter(id => id !== fileId);
    }
    
    // Delete the file
    this.files.delete(fileId);
    
    console.log(`Deleted file: ${file.name} (${fileId})`);
    return true;
  }
  
  // List files in a folder
  listFiles(folderId = 'root') {
    if (!this.folders.has(folderId)) {
      throw new Error(`Folder not found: ${folderId}`);
    }
    
    const folder = this.folders.get(folderId);
    const files = folder.files.map(id => {
      const file = this.files.get(id);
      return {
        id: file.id,
        name: file.name,
        mimeType: file.mimeType,
        webViewLink: file.webViewLink,
        webContentLink: file.webContentLink
      };
    });
    
    console.log(`Listed ${files.length} files in folder: ${folder.name} (${folderId})`);
    return files;
  }
}

// Create mock Google Drive instance
const mockDrive = new MockGoogleDrive();

// Create mock file storage service
const mockFileStorage = {
  // Initialize file storage
  async initFileStorage() {
    console.log('Initializing mock file storage...');
    
    // Create folders
    this.profilesFolderId = mockDrive.createFolder('Profiles').id;
    this.memoriesFolderId = mockDrive.createFolder('Memories').id;
    
    console.log(`Profiles folder ID: ${this.profilesFolderId}`);
    console.log(`Memories folder ID: ${this.memoriesFolderId}`);
    
    return true;
  },
  
  // Upload profile image
  async uploadProfileImage(imageBuffer, userId) {
    console.log(`Uploading profile image for user: ${userId}`);
    
    const fileName = `profile_${userId}_${Date.now()}.jpg`;
    const mimeType = 'image/jpeg';
    
    const file = mockDrive.uploadFile(
      imageBuffer,
      fileName,
      mimeType,
      this.profilesFolderId
    );
    
    return {
      fileId: file.id,
      fileName: file.name,
      webViewLink: file.webViewLink,
      webContentLink: file.webContentLink
    };
  },
  
  // Get profile image
  async getProfileImage(fileId) {
    console.log(`Getting profile image: ${fileId}`);
    return mockDrive.getFile(fileId);
  },
  
  // Upload memory image
  async uploadMemoryImage(imageBuffer, name) {
    console.log(`Uploading memory image: ${name}`);
    
    const fileName = `memory_${name.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.jpg`;
    const mimeType = 'image/jpeg';
    
    const file = mockDrive.uploadFile(
      imageBuffer,
      fileName,
      mimeType,
      this.memoriesFolderId
    );
    
    return {
      fileId: file.id,
      fileName: file.name,
      webViewLink: file.webViewLink,
      webContentLink: file.webContentLink
    };
  },
  
  // Get memory image
  async getMemoryImage(fileId) {
    console.log(`Getting memory image: ${fileId}`);
    return mockDrive.getFile(fileId);
  },
  
  // Delete file
  async deleteFile(fileId) {
    console.log(`Deleting file: ${fileId}`);
    return mockDrive.deleteFile(fileId);
  },
  
  // List profile images
  async listProfileImages() {
    console.log('Listing profile images');
    return mockDrive.listFiles(this.profilesFolderId);
  },
  
  // List memory images
  async listMemoryImages() {
    console.log('Listing memory images');
    return mockDrive.listFiles(this.memoriesFolderId);
  }
};

// Run tests with mock file storage
async function runMockTests() {
  try {
    console.log('Running tests with mock Google Drive...\n');
    
    // Initialize file storage
    await mockFileStorage.initFileStorage();
    
    // Test 1: Upload profile image
    console.log('\nTest 1: Uploading profile image...');
    const profileImageBuffer = Buffer.from('This is a test profile image');
    const profileUploadResult = await mockFileStorage.uploadProfileImage(profileImageBuffer, 'test-user-123');
    
    console.log('Profile image uploaded:');
    console.log(profileUploadResult);
    
    // Test 2: Get profile image
    console.log('\nTest 2: Getting profile image...');
    const profileImage = await mockFileStorage.getProfileImage(profileUploadResult.fileId);
    
    console.log('Profile image retrieved:');
    console.log(`Content length: ${profileImage.content.length} bytes`);
    console.log(`Content: ${profileImage.content.toString()}`);
    
    // Test 3: Upload memory image
    console.log('\nTest 3: Uploading memory image...');
    const memoryImageBuffer = Buffer.from('This is a test memory image');
    const memoryUploadResult = await mockFileStorage.uploadMemoryImage(memoryImageBuffer, 'Test Memory');
    
    console.log('Memory image uploaded:');
    console.log(memoryUploadResult);
    
    // Test 4: Get memory image
    console.log('\nTest 4: Getting memory image...');
    const memoryImage = await mockFileStorage.getMemoryImage(memoryUploadResult.fileId);
    
    console.log('Memory image retrieved:');
    console.log(`Content length: ${memoryImage.content.length} bytes`);
    console.log(`Content: ${memoryImage.content.toString()}`);
    
    // Test 5: List profile images
    console.log('\nTest 5: Listing profile images...');
    const profileImages = await mockFileStorage.listProfileImages();
    
    console.log(`Found ${profileImages.length} profile images:`);
    profileImages.forEach(image => {
      console.log(`- ${image.name} (${image.id})`);
    });
    
    // Test 6: List memory images
    console.log('\nTest 6: Listing memory images...');
    const memoryImages = await mockFileStorage.listMemoryImages();
    
    console.log(`Found ${memoryImages.length} memory images:`);
    memoryImages.forEach(image => {
      console.log(`- ${image.name} (${image.id})`);
    });
    
    // Test 7: Delete files
    console.log('\nTest 7: Deleting files...');
    await mockFileStorage.deleteFile(profileUploadResult.fileId);
    await mockFileStorage.deleteFile(memoryUploadResult.fileId);
    
    console.log('All tests completed successfully!');
  } catch (error) {
    console.error('Error running mock tests:', error);
  }
}

// Run the mock tests
runMockTests();
