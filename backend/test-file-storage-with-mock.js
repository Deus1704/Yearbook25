/**
 * Test script for file storage service with mock support
 *
 * This script tests the file storage service's ability to:
 * 1. Create (upload) files
 * 2. Read (download) files
 * 3. Delete files
 * 4. List files
 *
 * It uses the mock implementation by default, but can be configured
 * to use the real Google Drive implementation by setting the
 * USE_MOCK_STORAGE environment variable to 'false'.
 */

const fileStorage = require('./services/fileStorageWithMock');
const fs = require('fs');
const path = require('path');

// Create a test buffer
function createTestBuffer(text = 'Test content') {
  return Buffer.from(text);
}

async function runTests() {
  try {
    console.log('Testing file storage service...\n');
    console.log(`Using mock storage: ${process.env.USE_MOCK_STORAGE === 'true' ? 'Yes' : 'No'}`);

    // Initialize file storage
    console.log('\nInitializing file storage...');
    await fileStorage.initFileStorage();
    console.log('File storage initialized successfully.');

    // Test 1: Upload profile image
    console.log('\nTest 1: Uploading profile image...');
    const profileImageBuffer = createTestBuffer('This is a test profile image');
    const profileUploadResult = await fileStorage.uploadProfileImage(profileImageBuffer, 'test-user-123');

    console.log('Profile image uploaded:');
    console.log(profileUploadResult);

    // Test 2: Get profile image
    console.log('\nTest 2: Getting profile image...');
    const profileImage = await fileStorage.getProfileImage(profileUploadResult.fileId);

    console.log('Profile image retrieved:');
    console.log(`Content length: ${profileImage.content.length} bytes`);
    if (profileImage.content.length < 1000) {
      console.log(`Content: ${profileImage.content.toString()}`);
    }

    // Test 3: Upload memory image
    console.log('\nTest 3: Uploading memory image...');
    const memoryImageBuffer = createTestBuffer('This is a test memory image');
    const memoryUploadResult = await fileStorage.uploadMemoryImage(memoryImageBuffer, 'Test Memory');

    console.log('Memory image uploaded:');
    console.log(memoryUploadResult);

    // Test 4: Get memory image
    console.log('\nTest 4: Getting memory image...');
    const memoryImage = await fileStorage.getMemoryImage(memoryUploadResult.fileId);

    console.log('Memory image retrieved:');
    console.log(`Content length: ${memoryImage.content.length} bytes`);
    if (memoryImage.content.length < 1000) {
      console.log(`Content: ${memoryImage.content.toString()}`);
    }

    // Test 5: List profile images
    console.log('\nTest 5: Listing profile images...');
    const profileImages = await fileStorage.listProfileImages();

    console.log(`Found ${profileImages.length} profile images:`);
    profileImages.forEach(image => {
      console.log(`- ${image.name} (${image.id})`);
    });

    // Test 6: List memory images
    console.log('\nTest 6: Listing memory images...');
    const memoryImages = await fileStorage.listMemoryImages();

    console.log(`Found ${memoryImages.length} memory images:`);
    memoryImages.forEach(image => {
      console.log(`- ${image.name} (${image.id})`);
    });

    // Test 7: Delete files
    console.log('\nTest 7: Deleting files...');
    await fileStorage.deleteFile(profileUploadResult.fileId);
    await fileStorage.deleteFile(memoryUploadResult.fileId);

    console.log('All tests completed successfully!');
  } catch (error) {
    console.error('Error running tests:', error);
  }
}

// Set USE_MOCK_STORAGE environment variable to true
process.env.USE_MOCK_STORAGE = 'true';

// Run the tests
runTests();
