/**
 * Third-Party CORS Proxy Utility
 * 
 * This utility provides a way to make API requests through a third-party CORS proxy
 * to avoid CORS issues when accessing the Yearbook25 API.
 */

// The URL of the third-party CORS proxy
const THIRD_PARTY_CORS_PROXY = 'https://corsproxy.io/?';

// The base URL of the API
const API_BASE_URL = 'https://yearbook25-xb9a.onrender.com/api';

/**
 * Make a request through the third-party CORS proxy
 * 
 * @param {string} endpoint - The API endpoint (without the base URL)
 * @param {Object} options - Request options
 * @param {string} options.method - HTTP method (GET, POST, PUT, DELETE)
 * @param {Object} options.data - Request body for POST/PUT requests
 * @param {Object} options.headers - Additional headers
 * @returns {Promise<Object>} - The response data
 */
async function proxyRequest(endpoint, options = {}) {
    const { method = 'GET', data = null, headers = {} } = options;
    
    try {
        // Construct the full URL
        const apiUrl = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
        const proxyUrl = `${THIRD_PARTY_CORS_PROXY}${encodeURIComponent(apiUrl)}`;
        
        // Prepare fetch options
        const fetchOptions = {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            },
            mode: 'cors'
        };
        
        // Add body for POST/PUT requests
        if (['POST', 'PUT'].includes(method) && data) {
            fetchOptions.body = JSON.stringify(data);
        }
        
        // Make the request
        const response = await fetch(proxyUrl, fetchOptions);
        
        // Check if the response is OK
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        // Parse the response
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        } else {
            return await response.text();
        }
    } catch (error) {
        console.error(`Error making proxy request to ${endpoint}:`, error);
        throw error;
    }
}

// Export the utility functions
const thirdPartyCorsProxy = {
    // Profiles
    getProfiles: () => proxyRequest('/profiles'),
    getProfile: (id) => proxyRequest(`/profiles/${id}`),
    getProfileByUserId: (userId) => proxyRequest(`/profiles/user/${userId}`),
    createProfile: (data) => proxyRequest('/profiles', { method: 'POST', data }),
    updateProfile: (id, data) => proxyRequest(`/profiles/${id}`, { method: 'PUT', data }),
    
    // Messages
    getMessages: () => proxyRequest('/messages'),
    getMessage: (id) => proxyRequest(`/messages/${id}`),
    createMessage: (data) => proxyRequest('/messages', { method: 'POST', data }),
    
    // Confessions
    getConfessions: () => proxyRequest('/confessions'),
    createConfession: (data) => proxyRequest('/confessions', { method: 'POST', data }),
    
    // Memories
    getMemories: () => proxyRequest('/memories'),
    getMemory: (id) => proxyRequest(`/memories/${id}`),
    createMemory: (data) => proxyRequest('/memories', { method: 'POST', data }),
    uploadMemories: (data) => proxyRequest('/memories/batch', { method: 'POST', data }),
    
    // Generic request method
    request: proxyRequest
};

// If using as a module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = thirdPartyCorsProxy;
}

// If using in browser
if (typeof window !== 'undefined') {
    window.thirdPartyCorsProxy = thirdPartyCorsProxy;
}
