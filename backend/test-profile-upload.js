/**
 * Test script for uploading a profile image via the API
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// API URL
const API_URL = 'http://localhost:5000/api';

// Test profile data
const testProfile = {
  name: 'Test User',
  designation: 'Test Designation',
  description: 'This is a test profile description',
  user_id: 'test-user-' + Date.now(),
  email: 'test-user-' + Date.now() + '@example.com'
};

// Create a test image
function createTestImage() {
  const { createCanvas } = require('canvas');
  const canvas = createCanvas(200, 200);
  const ctx = canvas.getContext('2d');

  // Fill background
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(0, 0, 200, 200);

  // Add text
  ctx.fillStyle = '#000000';
  ctx.font = '16px Arial';
  ctx.fillText('Test Profile Image', 30, 100);

  // Save to file
  const buffer = canvas.toBuffer('image/png');
  const filePath = path.join(__dirname, 'test-profile-image.png');
  fs.writeFileSync(filePath, buffer);

  return filePath;
}

// Upload profile
async function uploadProfile() {
  try {
    console.log('Creating test profile image...');
    const imagePath = createTestImage();

    console.log('Uploading profile...');
    const formData = new FormData();

    // Add profile data
    Object.keys(testProfile).forEach(key => {
      formData.append(key, testProfile[key]);
    });

    // Add image
    formData.append('image', fs.createReadStream(imagePath));

    // Upload profile
    const response = await axios.post(`${API_URL}/profiles`, formData, {
      headers: {
        ...formData.getHeaders()
      }
    });

    console.log('Profile created successfully:');
    console.log(response.data);

    // Clean up
    fs.unlinkSync(imagePath);

    return response.data;
  } catch (error) {
    console.error('Error uploading profile:');
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

// Get profile
async function getProfile(id) {
  try {
    console.log(`Getting profile with ID: ${id}...`);
    const response = await axios.get(`${API_URL}/profiles/${id}`);

    console.log('Profile retrieved successfully:');
    console.log(response.data);

    return response.data;
  } catch (error) {
    console.error('Error getting profile:');
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

// Get profile image
async function getProfileImage(id) {
  try {
    console.log(`Getting profile image for ID: ${id}...`);
    const response = await axios.get(`${API_URL}/profiles/${id}/image`, {
      responseType: 'arraybuffer'
    });

    console.log('Profile image retrieved successfully:');
    console.log(`Content type: ${response.headers['content-type']}`);
    console.log(`Content length: ${response.data.length} bytes`);

    // Save the image to a file
    const filePath = path.join(__dirname, `profile-${id}-image.jpg`);
    fs.writeFileSync(filePath, Buffer.from(response.data));

    console.log(`Profile image saved to: ${filePath}`);

    return filePath;
  } catch (error) {
    console.error('Error getting profile image:');
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
    console.log('Testing profile image upload and retrieval...\n');

    // Upload profile
    const profile = await uploadProfile();

    if (!profile) {
      console.error('Failed to create profile. Exiting tests.');
      return;
    }

    // Get profile
    await getProfile(profile.id);

    // Get profile image
    await getProfileImage(profile.id);

    console.log('\nAll tests completed successfully!');
  } catch (error) {
    console.error('Error running tests:', error);
  }
}

// Run the tests
runTests();
