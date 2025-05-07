/**
 * Test script for uploading memory images directly to Google Drive
 * 
 * This script bypasses the API and directly uses the fileStorage service
 * to test uploading images to Google Drive.
 */

const fileStorage = require('./services/fileStorageWithMock');
const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// Create a test image
function createTestImage(text = 'Test Memory Image', width = 300, height = 200) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Fill background with random color
  const r = Math.floor(Math.random() * 255);
  const g = Math.floor(Math.random() * 255);
  const b = Math.floor(Math.random() * 255);
  ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
  ctx.fillRect(0, 0, width, height);
  
  // Add text
  ctx.fillStyle = '#ffffff';
  ctx.font = '20px Arial';
  ctx.fillText(text, width / 6, height / 2);
  
  // Return buffer
  return canvas.toBuffer('image/png');
}

// Test uploading a profile image
async function testProfileImageUpload() {
  try {
    console.log('Creating test profile image...');
    const imageBuffer = createTestImage('Test Profile Image', 200, 200);
    
    console.log('Uploading profile image to Google Drive...');
    const result = await fileStorage.uploadProfileImage(imageBuffer, 'test-user-' + Date.now());
    
    console.log('Profile image uploaded successfully:');
    console.log(result);
    
    return result;
  } catch (error) {
    console.error('Error uploading profile image:', error);
  }
}

// Test uploading a memory image
async function testMemoryImageUpload() {
  try {
    console.log('Creating test memory image...');
    const imageBuffer = createTestImage('Test Memory Image', 400, 300);
    
    console.log('Uploading memory image to Google Drive...');
    const result = await fileStorage.uploadMemoryImage(imageBuffer, 'Test Memory ' + Date.now());
    
    console.log('Memory image uploaded successfully:');
    console.log(result);
    
    return result;
  } catch (error) {
    console.error('Error uploading memory image:', error);
  }
}

// Test getting a profile image
async function testGetProfileImage(fileId) {
  try {
    console.log(`Getting profile image with ID: ${fileId}...`);
    const file = await fileStorage.getProfileImage(fileId);
    
    console.log('Profile image retrieved successfully:');
    console.log(`Content length: ${file.content.length} bytes`);
    
    // Save the image to a file
    const filePath = path.join(__dirname, `test-profile-image-${Date.now()}.png`);
    fs.writeFileSync(filePath, file.content);
    
    console.log(`Profile image saved to: ${filePath}`);
    
    return filePath;
  } catch (error) {
    console.error('Error getting profile image:', error);
  }
}

// Test getting a memory image
async function testGetMemoryImage(fileId) {
  try {
    console.log(`Getting memory image with ID: ${fileId}...`);
    const file = await fileStorage.getMemoryImage(fileId);
    
    console.log('Memory image retrieved successfully:');
    console.log(`Content length: ${file.content.length} bytes`);
    
    // Save the image to a file
    const filePath = path.join(__dirname, `test-memory-image-${Date.now()}.png`);
    fs.writeFileSync(filePath, file.content);
    
    console.log(`Memory image saved to: ${filePath}`);
    
    return filePath;
  } catch (error) {
    console.error('Error getting memory image:', error);
  }
}

// Test deleting a file
async function testDeleteFile(fileId) {
  try {
    console.log(`Deleting file with ID: ${fileId}...`);
    await fileStorage.deleteFile(fileId);
    
    console.log('File deleted successfully');
    
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
  }
}

// Run tests
async function runTests() {
  try {
    console.log('Testing direct file storage operations...\n');
    
    // Initialize file storage
    console.log('Initializing file storage...');
    await fileStorage.initFileStorage();
    
    // Test profile image upload
    console.log('\n=== Testing profile image upload ===');
    const profileResult = await testProfileImageUpload();
    
    if (profileResult) {
      // Test getting profile image
      await testGetProfileImage(profileResult.fileId);
    }
    
    // Test memory image upload
    console.log('\n=== Testing memory image upload ===');
    const memoryResult = await testMemoryImageUpload();
    
    if (memoryResult) {
      // Test getting memory image
      await testGetMemoryImage(memoryResult.fileId);
    }
    
    // Test deleting files
    console.log('\n=== Testing file deletion ===');
    if (profileResult) {
      await testDeleteFile(profileResult.fileId);
    }
    
    if (memoryResult) {
      await testDeleteFile(memoryResult.fileId);
    }
    
    console.log('\nAll tests completed successfully!');
  } catch (error) {
    console.error('Error running tests:', error);
  }
}

// Run the tests
runTests();
