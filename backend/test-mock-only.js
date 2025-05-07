/**
 * Test script for mock file storage only
 * 
 * This script tests the mock file storage implementation.
 */

// Mock storage for testing
const mockStorage = {
  files: new Map(),
  folders: new Map(),
  initialized: false
};

// Folder IDs for different file types
let profilesFolderId;
let memoriesFolderId;

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
  profilesFolderId = 'folder_profiles_123';
  mockStorage.folders.set(profilesFolderId, {
    id: profilesFolderId,
    name: 'Profiles',
    files: [],
    folders: [],
    parent: 'root'
  });
  
  // Create memories folder
  memoriesFolderId = 'folder_memories_456';
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
  const id = `file_${Date.now()}`;
  
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
  
  console.log(`Uploaded file: ${fileName} (${id})`);
  return {
    fileId: id,
    fileName: file.name,
    webViewLink: file.webViewLink,
    webContentLink: file.webContentLink
  };
}

/**
 * Get a file from mock storage
 */
function mockGetFile(fileId) {
  if (!mockStorage.files.has(fileId)) {
    throw new Error(`File not found: ${fileId}`);
  }
  
  const file = mockStorage.files.get(fileId);
  
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

/**
 * Delete a file from mock storage
 */
function mockDeleteFile(fileId) {
  if (!mockStorage.files.has(fileId)) {
    throw new Error(`File not found: ${fileId}`);
  }
  
  const file = mockStorage.files.get(fileId);
  
  // Remove from parent folder
  if (file.parent && mockStorage.folders.has(file.parent)) {
    const folder = mockStorage.folders.get(file.parent);
    folder.files = folder.files.filter(id => id !== fileId);
  }
  
  // Delete the file
  mockStorage.files.delete(fileId);
  
  console.log(`Deleted file: ${file.name} (${fileId})`);
  return true;
}

/**
 * List files in a folder from mock storage
 */
function mockListFiles(folderId) {
  if (!mockStorage.folders.has(folderId)) {
    throw new Error(`Folder not found: ${folderId}`);
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
  
  console.log(`Listed ${files.length} files in folder: ${folder.name} (${folderId})`);
  return files;
}

/**
 * Upload a profile image
 */
function uploadProfileImage(imageBuffer, userId) {
  const fileName = `profile_${userId}_${Date.now()}.jpg`;
  const mimeType = 'image/jpeg';
  return mockUploadFile(imageBuffer, fileName, mimeType, profilesFolderId);
}

/**
 * Get a profile image
 */
function getProfileImage(fileId) {
  return mockGetFile(fileId);
}

/**
 * Upload a memory image
 */
function uploadMemoryImage(imageBuffer, name) {
  const fileName = `memory_${name.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.jpg`;
  const mimeType = 'image/jpeg';
  return mockUploadFile(imageBuffer, fileName, mimeType, memoriesFolderId);
}

/**
 * Get a memory image
 */
function getMemoryImage(fileId) {
  return mockGetFile(fileId);
}

/**
 * Delete a file
 */
function deleteFile(fileId) {
  return mockDeleteFile(fileId);
}

/**
 * List all profile images
 */
function listProfileImages() {
  return mockListFiles(profilesFolderId);
}

/**
 * List all memory images
 */
function listMemoryImages() {
  return mockListFiles(memoriesFolderId);
}

// Run tests
async function runTests() {
  try {
    console.log('Testing mock file storage...\n');
    
    // Initialize mock storage
    initMockStorage();
    
    // Test 1: Upload profile image
    console.log('\nTest 1: Uploading profile image...');
    const profileImageBuffer = Buffer.from('This is a test profile image');
    const profileUploadResult = uploadProfileImage(profileImageBuffer, 'test-user-123');
    
    console.log('Profile image uploaded:');
    console.log(profileUploadResult);
    
    // Test 2: Get profile image
    console.log('\nTest 2: Getting profile image...');
    const profileImage = getProfileImage(profileUploadResult.fileId);
    
    console.log('Profile image retrieved:');
    console.log(`Content length: ${profileImage.content.length} bytes`);
    console.log(`Content: ${profileImage.content.toString()}`);
    
    // Test 3: Upload memory image
    console.log('\nTest 3: Uploading memory image...');
    const memoryImageBuffer = Buffer.from('This is a test memory image');
    const memoryUploadResult = uploadMemoryImage(memoryImageBuffer, 'Test Memory');
    
    console.log('Memory image uploaded:');
    console.log(memoryUploadResult);
    
    // Test 4: Get memory image
    console.log('\nTest 4: Getting memory image...');
    const memoryImage = getMemoryImage(memoryUploadResult.fileId);
    
    console.log('Memory image retrieved:');
    console.log(`Content length: ${memoryImage.content.length} bytes`);
    console.log(`Content: ${memoryImage.content.toString()}`);
    
    // Test 5: List profile images
    console.log('\nTest 5: Listing profile images...');
    const profileImages = listProfileImages();
    
    console.log(`Found ${profileImages.length} profile images:`);
    profileImages.forEach(image => {
      console.log(`- ${image.name} (${image.id})`);
    });
    
    // Test 6: List memory images
    console.log('\nTest 6: Listing memory images...');
    const memoryImages = listMemoryImages();
    
    console.log(`Found ${memoryImages.length} memory images:`);
    memoryImages.forEach(image => {
      console.log(`- ${image.name} (${image.id})`);
    });
    
    // Test 7: Delete files
    console.log('\nTest 7: Deleting files...');
    deleteFile(profileUploadResult.fileId);
    deleteFile(memoryUploadResult.fileId);
    
    console.log('All tests completed successfully!');
  } catch (error) {
    console.error('Error running tests:', error);
  }
}

// Run the tests
runTests();
