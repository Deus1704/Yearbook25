/**
 * CORS Proxy Utility
 * 
 * This utility provides a way to make API requests through a CORS proxy
 * to avoid CORS issues when accessing the Yearbook25 API.
 */

// The URL of the CORS proxy
const CORS_PROXY_URL = '/yearbook/2025/cors-proxy.html';

// The base URL of the API
const API_BASE_URL = 'https://yearbook25-git-backend-only-jayraj-dulanges-projects.vercel.app/api';

/**
 * Make a request through the CORS proxy
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
        const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
        
        // Make the request through the proxy
        const response = await fetch(CORS_PROXY_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                url,
                method,
                data,
                headers
            })
        });
        
        // Parse the response
        const result = await response.json();
        
        // Check for errors
        if (result.error) {
            throw new Error(result.error);
        }
        
        // Return the data
        return result.data;
    } catch (error) {
        console.error(`Error making proxy request to ${endpoint}:`, error);
        throw error;
    }
}

// Export the utility functions
const corsProxy = {
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
    module.exports = corsProxy;
}

// If using in browser
if (typeof window !== 'undefined') {
    window.corsProxy = corsProxy;
}
