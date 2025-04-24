/**
 * Multi-CORS Proxy Utility
 * 
 * This utility provides multiple ways to make API requests through CORS proxies
 * to avoid CORS issues when accessing the Yearbook25 API.
 */

// The base URL of the API
const API_BASE_URL = 'https://yearbook25-git-backend-only-jayraj-dulanges-projects.vercel.app/api';

// Available proxy methods
const PROXY_METHODS = {
    DIRECT: 'direct',
    LOCAL: 'local',
    THIRD_PARTY: 'third-party',
    JSONP: 'jsonp'
};

// Default proxy method
let currentProxyMethod = PROXY_METHODS.DIRECT;

/**
 * Set the proxy method to use
 * 
 * @param {string} method - The proxy method to use (one of PROXY_METHODS)
 */
function setProxyMethod(method) {
    if (Object.values(PROXY_METHODS).includes(method)) {
        currentProxyMethod = method;
        console.log(`Proxy method set to: ${method}`);
    } else {
        console.error(`Invalid proxy method: ${method}`);
    }
}

/**
 * Make a direct request to the API (no proxy)
 * 
 * @param {string} endpoint - The API endpoint (without the base URL)
 * @param {Object} options - Request options
 * @returns {Promise<Object>} - The response data
 */
async function directRequest(endpoint, options = {}) {
    const { method = 'GET', data = null, headers = {} } = options;
    
    // Construct the full URL
    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
    
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
    const response = await fetch(url, fetchOptions);
    
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
}

/**
 * Make a request through the local CORS proxy
 * 
 * @param {string} endpoint - The API endpoint (without the base URL)
 * @param {Object} options - Request options
 * @returns {Promise<Object>} - The response data
 */
async function localProxyRequest(endpoint, options = {}) {
    const { method = 'GET', data = null, headers = {} } = options;
    
    // Construct the full URL
    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
    
    // Make the request through the proxy
    const response = await fetch('/yearbook/2025/cors-proxy.html', {
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
}

/**
 * Make a request through a third-party CORS proxy
 * 
 * @param {string} endpoint - The API endpoint (without the base URL)
 * @param {Object} options - Request options
 * @returns {Promise<Object>} - The response data
 */
async function thirdPartyProxyRequest(endpoint, options = {}) {
    const { method = 'GET', data = null, headers = {} } = options;
    
    // Construct the full URL
    const apiUrl = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(apiUrl)}`;
    
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
}

/**
 * Make a request using JSONP (for GET requests only)
 * 
 * @param {string} endpoint - The API endpoint (without the base URL)
 * @returns {Promise<Object>} - The response data
 */
function jsonpRequest(endpoint) {
    return new Promise((resolve, reject) => {
        // JSONP only works for GET requests
        const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
        
        // Create a unique callback name
        const callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());
        
        // Create script element
        const script = document.createElement('script');
        script.src = `${url}${url.includes('?') ? '&' : '?'}callback=${callbackName}`;
        
        // Define the callback function
        window[callbackName] = function(data) {
            // Clean up
            delete window[callbackName];
            document.body.removeChild(script);
            
            // Resolve the promise
            resolve(data);
        };
        
        // Handle errors
        script.onerror = function() {
            // Clean up
            delete window[callbackName];
            document.body.removeChild(script);
            
            // Reject the promise
            reject(new Error('JSONP request failed'));
        };
        
        // Add the script to the page
        document.body.appendChild(script);
    });
}

/**
 * Make a request using the current proxy method
 * 
 * @param {string} endpoint - The API endpoint (without the base URL)
 * @param {Object} options - Request options
 * @returns {Promise<Object>} - The response data
 */
async function proxyRequest(endpoint, options = {}) {
    try {
        switch (currentProxyMethod) {
            case PROXY_METHODS.DIRECT:
                return await directRequest(endpoint, options);
            case PROXY_METHODS.LOCAL:
                return await localProxyRequest(endpoint, options);
            case PROXY_METHODS.THIRD_PARTY:
                return await thirdPartyProxyRequest(endpoint, options);
            case PROXY_METHODS.JSONP:
                // JSONP only works for GET requests
                if (options.method && options.method !== 'GET') {
                    throw new Error('JSONP only supports GET requests');
                }
                return await jsonpRequest(endpoint);
            default:
                throw new Error(`Unknown proxy method: ${currentProxyMethod}`);
        }
    } catch (error) {
        console.error(`Error making proxy request to ${endpoint}:`, error);
        throw error;
    }
}

/**
 * Try all proxy methods until one works
 * 
 * @param {string} endpoint - The API endpoint (without the base URL)
 * @param {Object} options - Request options
 * @returns {Promise<Object>} - The response data
 */
async function tryAllProxyMethods(endpoint, options = {}) {
    // Only try JSONP for GET requests
    const methodsToTry = options.method === 'GET' 
        ? [PROXY_METHODS.DIRECT, PROXY_METHODS.LOCAL, PROXY_METHODS.THIRD_PARTY, PROXY_METHODS.JSONP]
        : [PROXY_METHODS.DIRECT, PROXY_METHODS.LOCAL, PROXY_METHODS.THIRD_PARTY];
    
    let lastError = null;
    
    for (const method of methodsToTry) {
        try {
            // Set the proxy method
            setProxyMethod(method);
            
            // Try the request
            const result = await proxyRequest(endpoint, options);
            
            // If successful, return the result
            return result;
        } catch (error) {
            console.warn(`Proxy method ${method} failed:`, error);
            lastError = error;
            // Continue to the next method
        }
    }
    
    // If all methods failed, throw the last error
    throw lastError || new Error('All proxy methods failed');
}

// Export the utility functions
const multiCorsProxy = {
    // Proxy methods
    PROXY_METHODS,
    setProxyMethod,
    getCurrentMethod: () => currentProxyMethod,
    
    // API methods
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
    
    // Generic request methods
    request: proxyRequest,
    tryAllMethods: tryAllProxyMethods
};

// If using as a module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = multiCorsProxy;
}

// If using in browser
if (typeof window !== 'undefined') {
    window.multiCorsProxy = multiCorsProxy;
}
