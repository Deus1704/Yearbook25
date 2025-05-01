/**
 * Test script for the CORS proxy
 * 
 * This script tests the CORS proxy by making a request to the proxy endpoint
 * and verifying that it returns the expected response.
 */

const axios = require('axios');

// The URL of the CORS proxy
const CORS_PROXY_URL = 'https://yearbook25-git-backend-only-jayraj-dulanges-projects.vercel.app/api/cors-proxy';

// The URL to test
const TEST_URL = 'https://yearbook25-git-backend-only-jayraj-dulanges-projects.vercel.app/api/profiles';

async function testCorsProxy() {
  try {
    console.log(`Testing CORS proxy at ${CORS_PROXY_URL}`);
    console.log(`Requesting ${TEST_URL} through the proxy...`);
    
    const response = await axios.post(CORS_PROXY_URL, {
      url: TEST_URL,
      method: 'GET'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
    console.log('CORS proxy test successful!');
  } catch (error) {
    console.error('CORS proxy test failed:', error.message);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testCorsProxy();
