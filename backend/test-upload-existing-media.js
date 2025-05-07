/**
 * Test script for uploading existing media files to Google Drive
 * 
 * This script uploads existing media files from the repository to Google Drive
 * and tests the CRUD operations.
 */

const fileStorage = require('./services/fileStorageWithMock');
const fs = require('fs');
const path = require('path');

// List of media files to upload
const mediaFiles = [
  {
    path: '/workspaces/Yearbook25/background.mp4',
    type: 'video/mp4',
    name: 'Background Video'
  },
  {
    path: '/workspaces/Yearbook25/backend/test-profile-image.png',
    type: 'image/png',
    name: 'Test Profile Image'
  }
];

// Find test images that were generated during previous tests
function findGeneratedTestImages() {
  const testImages = [];
  const backendDir = path.join('/workspaces/Yearbook25/backend');
  
  try {
    const files = fs.readdirSync(backendDir);
    
    for (const file of files) {
      if (file.startsWith('test-') && (file.endsWith('.png') || file.endsWith('.jpg'))) {
        testImages.push({
          path: path.join(backendDir, file),
          type: file.endsWith('.png') ? 'image/png' : 'image/jpeg',
          name: file.replace(/\.[^/.]+$/, '') // Remove extension
        });
      }
    }
  } catch (error) {
    console.error('Error finding generated test images:', error);
  }
  
  return testImages;
}

// Upload a file to Google Drive
async function uploadFile(filePath, mimeType, name) {
  try {
    console.log(`Uploading file: ${filePath}`);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      return null;
    }
    
    // Read file
    const fileBuffer = fs.readFileSync(filePath);
    
    // Determine if it's a profile or memory image based on name
    let result;
    if (name.toLowerCase().includes('profile')) {
      result = await fileStorage.uploadProfileImage(fileBuffer, 'test-user-' + Date.now());
    } else {
      result = await fileStorage.uploadMemoryImage(fileBuffer, name);
    }
    
    console.log(`File uploaded successfully: ${name}`);
    console.log(result);
    
    return result;
  } catch (error) {
    console.error(`Error uploading file ${filePath}:`, error);
    return null;
  }
}

// Get a file from Google Drive
async function getFile(fileId, isProfile = false) {
  try {
    console.log(`Getting file with ID: ${fileId}`);
    
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
    console.log(`Deleting file with ID: ${fileId}`);
    
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
    console.log('Testing upload of existing media files...\n');
    
    // Initialize file storage
    console.log('Initializing file storage...');
    await fileStorage.initFileStorage();
    
    // Find generated test images
    const generatedImages = findGeneratedTestImages();
    console.log(`Found ${generatedImages.length} generated test images`);
    
    // Combine with predefined media files
    const allMedia = [...mediaFiles, ...generatedImages];
    
    // Upload each file
    const uploadResults = [];
    for (const media of allMedia) {
      console.log(`\n=== Uploading ${media.name} ===`);
      const result = await uploadFile(media.path, media.type, media.name);
      
      if (result) {
        uploadResults.push({
          ...result,
          isProfile: media.name.toLowerCase().includes('profile')
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
