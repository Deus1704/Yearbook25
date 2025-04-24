/**
 * Enhanced API Proxy Utility
 *
 * This utility provides a way to make API requests through a CORS proxy
 * to avoid CORS issues when accessing the Yearbook25 API.
 */

// The base URL of the API
const API_BASE_URL = 'https://yearbook25-git-backend-only-jayraj-dulanges-projects.vercel.app/api';

// The URL of the CORS proxy
const CORS_PROXY_URL = '/api/cors-proxy';

// Fallback to direct API calls if the proxy fails
let useDirectAPI = false;

/**
 * Make a request through the CORS proxy
 *
 * @param {string} endpoint - The API endpoint (without the base URL)
 * @param {Object} options - Request options
 * @param {string} options.method - HTTP method (GET, POST, PUT, DELETE)
 * @param {Object} options.data - Request body for POST/PUT requests
 * @param {Object} options.headers - Additional headers to send
 * @returns {Promise<Object>} - The response data
 */
async function apiRequest(endpoint, options = {}) {
  const { method = 'GET', data = null, headers = {} } = options;

  try {
    // Construct the full URL
    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;

    // If we're using direct API calls (fallback mode)
    if (useDirectAPI) {
      return await directApiRequest(url, method, data, headers);
    }

    // Prepare the request options for the proxy
    const requestOptions = {
      method: 'POST', // Always use POST for the proxy request
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      credentials: 'include', // Include cookies if any
      body: JSON.stringify({
        url,
        method,
        data,
        headers
      })
    };

    // Make the request through the proxy
    console.log(`Making ${method} request to ${endpoint} via proxy`);
    const response = await fetch(CORS_PROXY_URL, requestOptions);

    // Check if the response is OK
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || errorData.message || `HTTP error! Status: ${response.status}`);
    }

    // Parse the response
    return await response.json();
  } catch (error) {
    console.error(`Error making request to ${endpoint} via proxy:`, error);

    // If the proxy fails, try direct API call as fallback
    if (!useDirectAPI) {
      console.log('Trying direct API call as fallback...');
      useDirectAPI = true;
      try {
        const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
        return await directApiRequest(url, method, data, headers);
      } catch (directError) {
        console.error(`Direct API call also failed:`, directError);
        // Reset useDirectAPI for next request
        useDirectAPI = false;
        throw directError;
      }
    }

    throw error;
  }
}

/**
 * Make a direct request to the API (fallback)
 *
 * @param {string} url - The full API URL
 * @param {string} method - HTTP method
 * @param {Object} data - Request body
 * @param {Object} headers - Request headers
 * @returns {Promise<Object>} - The response data
 */
async function directApiRequest(url, method, data, headers = {}) {
  // Use a third-party CORS proxy as a last resort
  const corsProxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;

  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    mode: 'cors'
  };

  // Add body for POST/PUT requests
  if (['POST', 'PUT', 'PATCH'].includes(method) && data) {
    options.body = JSON.stringify(data);
  }

  console.log(`Making direct API call to ${corsProxyUrl}`);
  const response = await fetch(corsProxyUrl, options);

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  return await response.json();
}

// Export the API functions
const api = {
  // Profiles
  getProfiles: () => apiRequest('/profiles'),
  getProfile: (id) => apiRequest(`/profiles/${id}`),
  getProfileByUserId: (userId) => apiRequest(`/profiles/user/${userId}`),
  createProfile: (data) => apiRequest('/profiles', { method: 'POST', data }),
  updateProfile: (id, data) => apiRequest(`/profiles/${id}`, { method: 'PUT', data }),

  // Messages
  getMessages: () => apiRequest('/messages'),
  getMessage: (id) => apiRequest(`/messages/${id}`),
  createMessage: (data) => apiRequest('/messages', { method: 'POST', data }),

  // Confessions
  getConfessions: () => apiRequest('/confessions'),
  createConfession: (data) => apiRequest('/confessions', { method: 'POST', data }),

  // Memories
  getMemories: () => apiRequest('/memories'),
  getMemory: (id) => apiRequest(`/memories/${id}`),
  createMemory: (data) => apiRequest('/memories', { method: 'POST', data }),
  uploadMemories: (data) => apiRequest('/memories/batch', { method: 'POST', data }),

  // Generic request method
  request: apiRequest
};

// If using as a module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = api;
}

// If using in browser
if (typeof window !== 'undefined') {
  window.api = api;
}
