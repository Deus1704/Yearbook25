/**
 * Test script for batch uploading multiple images to Google Drive
 * 
 * This script tests uploading multiple images at once to Google Drive,
 * which is important for the Memory Lane section.
 */

const fileStorage = require('./services/fileStorageWithMock');
const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// Create multiple test images
function createTestImages(count = 5) {
  const images = [];
  
  for (let i = 0; i < count; i++) {
    const canvas = createCanvas(300, 200);
    const ctx = canvas.getContext('2d');
    
    // Fill background with random color
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    ctx.fillRect(0, 0, 300, 200);
    
    // Add text
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px Arial';
    ctx.fillText(`Memory Image ${i + 1}`, 50, 100);
    
    // Get buffer
    const buffer = canvas.toBuffer('image/png');
    
    images.push({
      buffer,
      name: `Memory Image ${i + 1}`
    });
  }
  
  return images;
}

// Upload multiple images in batch
async function uploadBatchImages(images) {
  try {
    console.log(`Uploading ${images.length} images in batch...`);
    
    const results = [];
    
    // Upload each image
    for (const image of images) {
      const result = await fileStorage.uploadMemoryImage(image.buffer, image.name);
      results.push(result);
      
      console.log(`Uploaded image: ${image.name}`);
      console.log(result);
    }
    
    return results;
  } catch (error) {
    console.error('Error uploading batch images:', error);
    return [];
  }
}

// Get all memory images
async function getAllMemoryImages() {
  try {
    console.log('Getting all memory images...');
    
    const images = await fileStorage.listMemoryImages();
    
    console.log(`Found ${images.length} memory images:`);
    images.forEach(image => {
      console.log(`- ${image.name} (${image.id})`);
    });
    
    return images;
  } catch (error) {
    console.error('Error getting memory images:', error);
    return [];
  }
}

// Delete all memory images
async function deleteAllMemoryImages(images) {
  try {
    console.log(`Deleting ${images.length} memory images...`);
    
    for (const image of images) {
      await fileStorage.deleteFile(image.fileId);
      console.log(`Deleted image: ${image.fileName} (${image.fileId})`);
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting memory images:', error);
    return false;
  }
}

// Run tests
async function runTests() {
  try {
    console.log('Testing batch upload of memory images...\n');
    
    // Initialize file storage
    console.log('Initializing file storage...');
    await fileStorage.initFileStorage();
    
    // Create test images
    console.log('Creating test images...');
    const images = createTestImages(5);
    console.log(`Created ${images.length} test images`);
    
    // Upload images in batch
    console.log('\n=== Uploading images in batch ===');
    const uploadResults = await uploadBatchImages(images);
    
    if (uploadResults.length === 0) {
      console.error('Failed to upload images. Exiting tests.');
      return;
    }
    
    // Get all memory images
    console.log('\n=== Getting all memory images ===');
    const allImages = await getAllMemoryImages();
    
    // Delete all uploaded images
    console.log('\n=== Deleting all uploaded images ===');
    await deleteAllMemoryImages(uploadResults);
    
    console.log('\nAll tests completed successfully!');
  } catch (error) {
    console.error('Error running tests:', error);
  }
}

// Run the tests
runTests();
