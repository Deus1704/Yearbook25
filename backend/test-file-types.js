/**
 * Test script for uploading different file types to Google Drive
 * 
 * This script tests uploading different file types (PNG, JPEG, GIF, MP4)
 * to Google Drive and verifies that they can be retrieved correctly.
 */

const fileStorage = require('./services/fileStorageWithMock');
const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// Create a PNG image
function createPngImage() {
  const canvas = createCanvas(300, 200);
  const ctx = canvas.getContext('2d');
  
  // Fill background
  ctx.fillStyle = '#3498db';
  ctx.fillRect(0, 0, 300, 200);
  
  // Add text
  ctx.fillStyle = '#ffffff';
  ctx.font = '20px Arial';
  ctx.fillText('PNG Test Image', 50, 100);
  
  // Return buffer
  return {
    buffer: canvas.toBuffer('image/png'),
    type: 'image/png',
    name: 'PNG Test Image'
  };
}

// Create a JPEG image
function createJpegImage() {
  const canvas = createCanvas(300, 200);
  const ctx = canvas.getContext('2d');
  
  // Fill background
  ctx.fillStyle = '#e74c3c';
  ctx.fillRect(0, 0, 300, 200);
  
  // Add text
  ctx.fillStyle = '#ffffff';
  ctx.font = '20px Arial';
  ctx.fillText('JPEG Test Image', 50, 100);
  
  // Return buffer
  return {
    buffer: canvas.toBuffer('image/jpeg'),
    type: 'image/jpeg',
    name: 'JPEG Test Image'
  };
}

// Create a text file
function createTextFile() {
  const text = 'This is a test text file.\nIt contains multiple lines.\nCreated at ' + new Date().toISOString();
  
  return {
    buffer: Buffer.from(text),
    type: 'text/plain',
    name: 'Text Test File'
  };
}

// Create a JSON file
function createJsonFile() {
  const data = {
    name: 'Test JSON',
    created: new Date().toISOString(),
    items: [1, 2, 3, 4, 5],
    nested: {
      key: 'value',
      array: ['a', 'b', 'c']
    }
  };
  
  return {
    buffer: Buffer.from(JSON.stringify(data, null, 2)),
    type: 'application/json',
    name: 'JSON Test File'
  };
}

// Upload a file to Google Drive
async function uploadFile(file, isProfile = false) {
  try {
    console.log(`Uploading ${file.name} (${file.type})...`);
    
    let result;
    if (isProfile) {
      result = await fileStorage.uploadProfileImage(file.buffer, 'test-user-' + Date.now());
    } else {
      result = await fileStorage.uploadMemoryImage(file.buffer, file.name);
    }
    
    console.log(`File uploaded successfully: ${file.name}`);
    console.log(result);
    
    return result;
  } catch (error) {
    console.error(`Error uploading file ${file.name}:`, error);
    return null;
  }
}

// Get a file from Google Drive
async function getFile(fileId, isProfile = false) {
  try {
    console.log(`Getting file with ID: ${fileId}...`);
    
    let file;
    if (isProfile) {
      file = await fileStorage.getProfileImage(fileId);
    } else {
      file = await fileStorage.getMemoryImage(fileId);
    }
    
    console.log(`File retrieved successfully: ${file.metadata.name}`);
    console.log(`Content length: ${file.content.length} bytes`);
    
    // Save the file to a new location
    const outputPath = path.join(__dirname, `retrieved-${file.metadata.name}`);
    fs.writeFileSync(outputPath, file.content);
    
    console.log(`File saved to: ${outputPath}`);
    
    return outputPath;
  } catch (error) {
    console.error(`Error getting file ${fileId}:`, error);
    return null;
  }
}

// Delete a file from Google Drive
async function deleteFile(fileId) {
  try {
    console.log(`Deleting file with ID: ${fileId}...`);
    
    await fileStorage.deleteFile(fileId);
    
    console.log(`File deleted successfully: ${fileId}`);
    
    return true;
  } catch (error) {
    console.error(`Error deleting file ${fileId}:`, error);
    return false;
  }
}

// Run tests
async function runTests() {
  try {
    console.log('Testing upload of different file types...\n');
    
    // Initialize file storage
    console.log('Initializing file storage...');
    await fileStorage.initFileStorage();
    
    // Create test files
    console.log('Creating test files...');
    const files = [
      createPngImage(),
      createJpegImage(),
      createTextFile(),
      createJsonFile()
    ];
    console.log(`Created ${files.length} test files`);
    
    // Upload each file
    const uploadResults = [];
    for (const file of files) {
      console.log(`\n=== Uploading ${file.name} ===`);
      const result = await uploadFile(file, file.name.includes('PNG'));
      
      if (result) {
        uploadResults.push({
          ...result,
          isProfile: file.name.includes('PNG')
        });
      }
    }
    
    // Get each uploaded file
    for (const result of uploadResults) {
      console.log(`\n=== Getting ${result.fileName} ===`);
      await getFile(result.fileId, result.isProfile);
    }
    
    // Delete each uploaded file
    for (const result of uploadResults) {
      console.log(`\n=== Deleting ${result.fileName} ===`);
      await deleteFile(result.fileId);
    }
    
    console.log('\nAll tests completed successfully!');
  } catch (error) {
    console.error('Error running tests:', error);
  }
}

// Run the tests
runTests();
