/**
 * CORS Fix Script for Yearbook25
 * 
 * This script patches the frontend application to use a CORS proxy
 * for all API requests to the backend. It should be included in the HTML
 * before any other scripts that make API requests.
 */

(function() {
  console.log('CORS Fix Script loaded!');
  
  // The base URL of the API
  const API_BASE_URL = 'https://yearbook25-git-backend-only-jayraj-dulanges-projects.vercel.app/api';
  
  // The URL of the CORS proxy service
  const CORS_PROXY_URL = 'https://corsproxy.io/?';
  
  // Store the original fetch function
  const originalFetch = window.fetch;
  
  // Override the fetch function to use the CORS proxy for API requests
  window.fetch = function(url, options = {}) {
    // Check if this is an API request
    if (typeof url === 'string' && url.includes(API_BASE_URL)) {
      console.log(`Intercepting API request to: ${url}`);
      
      // Use the CORS proxy
      const proxyUrl = `${CORS_PROXY_URL}${encodeURIComponent(url)}`;
      console.log(`Redirecting to proxy: ${proxyUrl}`);
      
      return originalFetch(proxyUrl, options);
    }
    
    // For non-API requests, use the original fetch
    return originalFetch(url, options);
  };
  
  // Check if axios is available
  if (window.axios) {
    console.log('Patching axios for CORS proxy');
    
    // Store the original axios request method
    const originalAxiosRequest = window.axios.request;
    
    // Override axios.request to use the CORS proxy for API requests
    window.axios.request = function(config) {
      // Check if this is an API request
      if (config.url && config.url.includes(API_BASE_URL)) {
        console.log(`Intercepting axios request to: ${config.url}`);
        
        // Use the CORS proxy
        config.url = `${CORS_PROXY_URL}${encodeURIComponent(config.url)}`;
        console.log(`Redirecting to proxy: ${config.url}`);
      }
      
      // Use the original axios.request with the modified config
      return originalAxiosRequest(config);
    };
  } else {
    // If axios is not available yet, we'll patch it when it becomes available
    console.log('axios not available yet, will patch it when loaded');
    
    // Watch for axios to be added to the window object
    Object.defineProperty(window, 'axios', {
      configurable: true,
      enumerable: true,
      get: function() {
        return this._axios;
      },
      set: function(axios) {
        console.log('axios loaded, patching for CORS proxy');
        
        // Store the original axios request method
        const originalAxiosRequest = axios.request;
        
        // Override axios.request to use the CORS proxy for API requests
        axios.request = function(config) {
          // Check if this is an API request
          if (config.url && config.url.includes(API_BASE_URL)) {
            console.log(`Intercepting axios request to: ${config.url}`);
            
            // Use the CORS proxy
            config.url = `${CORS_PROXY_URL}${encodeURIComponent(config.url)}`;
            console.log(`Redirecting to proxy: ${config.url}`);
          }
          
          // Use the original axios.request with the modified config
          return originalAxiosRequest(config);
        };
        
        // Store the patched axios
        this._axios = axios;
      }
    });
  }
  
  // Store the original XMLHttpRequest.prototype.open method
  const originalOpen = XMLHttpRequest.prototype.open;
  
  // Override the XMLHttpRequest.prototype.open method
  XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
    // Check if this is an API request
    if (typeof url === 'string' && url.includes(API_BASE_URL)) {
      console.log(`Intercepting XMLHttpRequest to: ${url}`);
      
      // Use the CORS proxy
      const proxyUrl = `${CORS_PROXY_URL}${encodeURIComponent(url)}`;
      console.log(`Redirecting to proxy: ${proxyUrl}`);
      
      // Call the original open method with the proxy URL
      return originalOpen.call(this, method, proxyUrl, async, user, password);
    }
    
    // For non-API requests, use the original open method
    return originalOpen.apply(this, arguments);
  };
  
  console.log('CORS Fix Script initialized successfully!');
})();
