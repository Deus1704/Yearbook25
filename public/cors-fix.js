/**
 * CORS Fix Script
 * 
 * This script patches the frontend application to use the CORS proxy
 * for all API requests. It should be included in the HTML before any
 * other scripts that make API requests.
 */

(function() {
  // The base URL of the API
  const API_BASE_URL = 'https://yearbook25-git-backend-only-jayraj-dulanges-projects.vercel.app/api';
  
  // The URL of the CORS proxy
  const CORS_PROXY_URL = '/api/cors-proxy';
  
  // Store the original fetch function
  const originalFetch = window.fetch;
  
  // Override the fetch function to use the CORS proxy for API requests
  window.fetch = function(url, options = {}) {
    // Check if this is an API request
    if (typeof url === 'string' && url.includes(API_BASE_URL)) {
      console.log(`Intercepting API request to: ${url}`);
      
      // Use the CORS proxy
      return originalFetch(CORS_PROXY_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {})
        },
        body: JSON.stringify({
          url,
          method: options.method || 'GET',
          data: options.body ? JSON.parse(options.body) : null,
          headers: options.headers || {}
        })
      });
    }
    
    // For non-API requests, use the original fetch
    return originalFetch(url, options);
  };
  
  // Store the original XMLHttpRequest.prototype.open method
  const originalOpen = XMLHttpRequest.prototype.open;
  
  // Override the XMLHttpRequest.prototype.open method
  XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
    // Store the original URL
    this._originalUrl = url;
    
    // Check if this is an API request
    if (typeof url === 'string' && url.includes(API_BASE_URL)) {
      console.log(`Intercepting XMLHttpRequest to: ${url}`);
      
      // Use the CORS proxy URL instead
      this._useProxy = true;
      this._originalMethod = method;
      
      // Call the original open method with the proxy URL
      return originalOpen.call(this, 'POST', CORS_PROXY_URL, async, user, password);
    }
    
    // For non-API requests, use the original open method
    return originalOpen.apply(this, arguments);
  };
  
  // Store the original XMLHttpRequest.prototype.send method
  const originalSend = XMLHttpRequest.prototype.send;
  
  // Override the XMLHttpRequest.prototype.send method
  XMLHttpRequest.prototype.send = function(body) {
    // Check if we're using the proxy
    if (this._useProxy) {
      // Set the Content-Type header
      this.setRequestHeader('Content-Type', 'application/json');
      
      // Create the proxy request body
      const proxyBody = JSON.stringify({
        url: this._originalUrl,
        method: this._originalMethod,
        data: body ? JSON.parse(body) : null
      });
      
      // Call the original send method with the proxy body
      return originalSend.call(this, proxyBody);
    }
    
    // For non-API requests, use the original send method
    return originalSend.apply(this, arguments);
  };
  
  // Store the original axios (if it exists)
  if (window.axios) {
    const originalAxiosRequest = window.axios.request;
    
    // Override axios.request
    window.axios.request = function(config) {
      // Check if this is an API request
      if (config.url && config.url.includes(API_BASE_URL)) {
        console.log(`Intercepting axios request to: ${config.url}`);
        
        // Use the CORS proxy
        return originalAxiosRequest({
          method: 'POST',
          url: CORS_PROXY_URL,
          data: {
            url: config.url,
            method: config.method || 'GET',
            data: config.data || null,
            headers: config.headers || {}
          },
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }
      
      // For non-API requests, use the original axios.request
      return originalAxiosRequest(config);
    };
  }
  
  console.log('CORS Fix Script loaded successfully!');
})();
