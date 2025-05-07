/**
 * Test script for uploading memory images via the API
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// API URL
const API_URL = 'http://localhost:5000/api';

// Create a test image
function createTestImage(text = 'Test Memory Image') {
  const { createCanvas } = require('canvas');
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
  ctx.fillText(text, 50, 100);
  
  // Save to file
  const buffer = canvas.toBuffer('image/png');
  const filePath = path.join(__dirname, `test-memory-image-${Date.now()}.png`);
  fs.writeFileSync(filePath, buffer);
  
  return filePath;
}

// Upload a single memory image
async function uploadMemoryImage() {
  try {
    console.log('Creating test memory image...');
    const imagePath = createTestImage();
    
    console.log('Uploading memory image...');
    const formData = new FormData();
    
    // Add name
    formData.append('name', 'Test Memory ' + Date.now());
    
    // Add image
    formData.append('image', fs.createReadStream(imagePath));
    
    // Upload memory
    const response = await axios.post(`${API_URL}/memories`, formData, {
      headers: {
        ...formData.getHeaders()
      }
    });
    
    console.log('Memory image uploaded successfully:');
    console.log(response.data);
    
    // Clean up
    fs.unlinkSync(imagePath);
    
    return response.data;
  } catch (error) {
    console.error('Error uploading memory image:');
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

// Upload multiple memory images
async function uploadMultipleMemoryImages(count = 3) {
  try {
    console.log(`Creating ${count} test memory images...`);
    const imagePaths = [];
    
    for (let i = 0; i < count; i++) {
      imagePaths.push(createTestImage(`Test Memory ${i + 1}`));
    }
    
    console.log('Uploading multiple memory images...');
    const formData = new FormData();
    
    // Add images
    imagePaths.forEach((path, index) => {
      formData.append('image', fs.createReadStream(path));
      formData.append(`name-${index}`, `Test Memory ${index + 1}`);
    });
    
    // Upload memories
    const response = await axios.post(`${API_URL}/memories/batch`, formData, {
      headers: {
        ...formData.getHeaders()
      }
    });
    
    console.log('Multiple memory images uploaded successfully:');
    console.log(response.data);
    
    // Clean up
    imagePaths.forEach(path => fs.unlinkSync(path));
    
    return response.data;
  } catch (error) {
    console.error('Error uploading multiple memory images:');
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

// Get all memories
async function getAllMemories() {
  try {
    console.log('Getting all memories...');
    const response = await axios.get(`${API_URL}/memories`);
    
    console.log('Memories retrieved successfully:');
    console.log(`Found ${response.data.length} memories`);
    
    return response.data;
  } catch (error) {
    console.error('Error getting memories:');
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

// Get memory image
async function getMemoryImage(id) {
  try {
    console.log(`Getting memory image for ID: ${id}...`);
    const response = await axios.get(`${API_URL}/memories/${id}/image`, {
      responseType: 'arraybuffer'
    });
    
    console.log('Memory image retrieved successfully:');
    console.log(`Content type: ${response.headers['content-type']}`);
    console.log(`Content length: ${response.data.length} bytes`);
    
    // Save the image to a file
    const filePath = path.join(__dirname, `memory-${id}-image.jpg`);
    fs.writeFileSync(filePath, Buffer.from(response.data));
    
    console.log(`Memory image saved to: ${filePath}`);
    
    return filePath;
  } catch (error) {
    console.error('Error getting memory image:');
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

// Run tests
async function runTests() {
  try {
    console.log('Testing memory image upload and retrieval...\n');
    
    // Upload single memory image
    console.log('\n=== Testing single memory image upload ===');
    const memory = await uploadMemoryImage();
    
    if (!memory) {
      console.error('Failed to upload memory image. Exiting tests.');
      return;
    }
    
    // Get memory image
    await getMemoryImage(memory.id);
    
    // Upload multiple memory images
    console.log('\n=== Testing multiple memory image upload ===');
    const memories = await uploadMultipleMemoryImages(3);
    
    if (!memories) {
      console.error('Failed to upload multiple memory images.');
    } else {
      // Get all memories
      const allMemories = await getAllMemories();
      
      if (allMemories && allMemories.length > 0) {
        // Get a random memory image
        const randomIndex = Math.floor(Math.random() * allMemories.length);
        await getMemoryImage(allMemories[randomIndex].id);
      }
    }
    
    console.log('\nAll tests completed successfully!');
  } catch (error) {
    console.error('Error running tests:', error);
  }
}

// Run the tests
runTests();
