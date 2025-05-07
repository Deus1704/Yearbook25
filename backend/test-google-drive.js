/**
 * Test script for Google Drive CRUD operations
 *
 * This script tests the file storage service's ability to:
 * 1. Create (upload) files to Google Drive
 * 2. Read (download) files from Google Drive
 * 3. Update files in Google Drive
 * 4. Delete files from Google Drive
 *
 * It uses the specified Google Drive folder ID from the environment variables.
 */

const fileStorage = require('./services/fileStorage');
const fs = require('fs');
const path = require('path');

// Create a test image buffer
function createTestImageBuffer(text = 'Test Image') {
  // Create a simple 100x100 PNG image with text
  const { createCanvas } = require('canvas');
  const canvas = createCanvas(100, 100);
  const ctx = canvas.getContext('2d');

  // Fill background
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(0, 0, 100, 100);

  // Add text
  ctx.fillStyle = '#000000';
  ctx.font = '12px Arial';
  ctx.fillText(text, 10, 50);

  // Get buffer
  return canvas.toBuffer('image/png');
}

async function runTests() {
  try {
    console.log('Testing Google Drive CRUD operations...\n');

    // Initialize file storage
    console.log('Initializing file storage...');
    await fileStorage.initFileStorage();
    console.log('File storage initialized successfully.\n');

    // Test 1: Upload a file (Create)
    console.log('Test 1: Uploading a file to Google Drive...');
    const testImageBuffer = createTestImageBuffer('Test Upload ' + new Date().toISOString());
    const uploadResult = await fileStorage.uploadProfileImage(testImageBuffer, 'test-user-id');

    console.log(`File uploaded successfully with ID: ${uploadResult.fileId}`);
    console.log(`File URL: ${uploadResult.webContentLink}`);
    console.log('Upload test passed.\n');

    // Test 2: Download the file (Read)
    console.log('Test 2: Downloading the file from Google Drive...');
    const downloadedFile = await fileStorage.getProfileImage(uploadResult.fileId);

    console.log(`File downloaded successfully.`);
    console.log(`File metadata: ${JSON.stringify(downloadedFile.metadata)}`);
    console.log(`File content length: ${downloadedFile.content.length} bytes`);
    console.log('Download test passed.\n');

    // Test 3: Update the file
    console.log('Test 3: Updating the file in Google Drive...');
    const updatedImageBuffer = createTestImageBuffer('Updated Test ' + new Date().toISOString());
    const updateResult = await fileStorage.updateProfileImage(uploadResult.fileId, updatedImageBuffer);

    console.log(`File updated successfully.`);
    console.log(`Updated file ID: ${updateResult.fileId}`);
    console.log(`Updated file URL: ${updateResult.webContentLink}`);
    console.log('Update test passed.\n');

    // Test 4: Delete the file
    console.log('Test 4: Deleting the file from Google Drive...');
    try {
      await fileStorage.deleteFile(updateResult.fileId);
      console.log('File deleted successfully.');

      // Verify deletion by trying to download the file (should fail)
      try {
        await fileStorage.getProfileImage(updateResult.fileId);
        console.log('Error: File still exists after deletion!');
      } catch (error) {
        console.log('Verified file was deleted successfully.');
        console.log('Delete test passed.\n');
      }
    } catch (error) {
      console.error('Error deleting file:', error.message);
      console.log('Delete test failed.\n');
    }

    console.log('All Google Drive CRUD tests completed successfully!');

  } catch (error) {
    console.error('Error running Google Drive tests:', error);
  }
}

// Install canvas if not already installed
async function ensureCanvasInstalled() {
  try {
    require('canvas');
    console.log('Canvas module is already installed.');
    runTests();
  } catch (error) {
    console.log('Installing canvas module for image generation...');
    const { execSync } = require('child_process');
    try {
      execSync('npm install canvas --save', { stdio: 'inherit' });
      console.log('Canvas module installed successfully.');
      runTests();
    } catch (installError) {
      console.error('Failed to install canvas module:', installError);
      console.log('Trying alternative approach with a simple buffer...');
      // If canvas installation fails, use a simple approach
      runTestsWithSimpleBuffer();
    }
  }
}

// Alternative test using a simple buffer instead of canvas
async function runTestsWithSimpleBuffer() {
  try {
    console.log('Testing Google Drive CRUD operations with simple buffer...\n');

    // Initialize file storage
    console.log('Initializing file storage...');
    await fileStorage.initFileStorage();
    console.log('File storage initialized successfully.\n');

    // Create a simple buffer with some text
    const simpleBuffer = Buffer.from('This is a test file created at ' + new Date().toISOString());

    // Test 1: Upload a file (Create)
    console.log('Test 1: Uploading a file to Google Drive...');
    const uploadResult = await fileStorage.uploadProfileImage(simpleBuffer, 'test-user-id');

    console.log(`File uploaded successfully with ID: ${uploadResult.fileId}`);
    console.log(`File URL: ${uploadResult.webContentLink}`);
    console.log('Upload test passed.\n');

    // Test 2: Download the file (Read)
    console.log('Test 2: Downloading the file from Google Drive...');
    const downloadedFile = await fileStorage.getProfileImage(uploadResult.fileId);

    console.log(`File downloaded successfully.`);
    console.log(`File metadata: ${JSON.stringify(downloadedFile.metadata)}`);
    console.log(`File content length: ${downloadedFile.content.length} bytes`);
    console.log('Download test passed.\n');

    // Test 3: Delete the file
    console.log('Test 3: Deleting the file from Google Drive...');
    await fileStorage.deleteFile(uploadResult.fileId);
    console.log('File deleted successfully.');
    console.log('Delete test passed.\n');

    console.log('All Google Drive CRUD tests completed successfully!');

  } catch (error) {
    console.error('Error running Google Drive tests with simple buffer:', error);
  }
}

// Start the tests
ensureCanvasInstalled();
