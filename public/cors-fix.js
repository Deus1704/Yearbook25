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

  // The URL of our custom CORS proxy endpoint
  const CUSTOM_PROXY_URL = 'https://yearbook25-git-backend-only-jayraj-dulanges-projects.vercel.app/api/cors-proxy';

  // Fallback to third-party CORS proxy service if our custom proxy fails
  const THIRD_PARTY_PROXY_URL = 'https://corsproxy.io/?';

  // Store the original fetch function
  const originalFetch = window.fetch;

  // Override the fetch function to use the CORS proxy for API requests
  window.fetch = function(url, options = {}) {
    // Check if this is an API request
    if (typeof url === 'string' && url.includes(API_BASE_URL)) {
      console.log(`Intercepting API request to: ${url}`);

      // Try our custom proxy first
      console.log(`Using custom CORS proxy: ${CUSTOM_PROXY_URL}`);

      // Create a new options object for the proxy request
      const proxyOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {})
        },
        body: JSON.stringify({
          url: url,
          method: options.method || 'GET',
          data: options.body ? JSON.parse(options.body) : null,
          headers: options.headers || {}
        })
      };

      // Return a promise that tries the custom proxy first, then falls back to the third-party proxy
      return originalFetch(CUSTOM_PROXY_URL, proxyOptions)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Custom proxy failed with status: ${response.status}`);
          }
          return response;
        })
        .catch(error => {
          console.error(`Custom proxy failed: ${error.message}`);
          console.log(`Falling back to third-party proxy: ${THIRD_PARTY_PROXY_URL}`);

          // Use the third-party CORS proxy as fallback
          const fallbackUrl = `${THIRD_PARTY_PROXY_URL}${encodeURIComponent(url)}`;
          console.log(`Redirecting to fallback proxy: ${fallbackUrl}`);

          return originalFetch(fallbackUrl, options);
        });
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

        // Create a new config for the proxy request
        const proxyConfig = {
          method: 'POST',
          url: CUSTOM_PROXY_URL,
          data: {
            url: config.url,
            method: config.method || 'GET',
            data: config.data || null,
            headers: config.headers || {}
          },
          headers: {
            'Content-Type': 'application/json'
          }
        };

        console.log(`Using custom CORS proxy: ${CUSTOM_PROXY_URL}`);

        // Return a promise that tries the custom proxy first, then falls back to the third-party proxy
        return originalAxiosRequest(proxyConfig)
          .catch(error => {
            console.error(`Custom proxy failed: ${error.message}`);
            console.log(`Falling back to third-party proxy: ${THIRD_PARTY_PROXY_URL}`);

            // Use the third-party CORS proxy as fallback
            const fallbackConfig = { ...config };
            fallbackConfig.url = `${THIRD_PARTY_PROXY_URL}${encodeURIComponent(config.url)}`;
            console.log(`Redirecting to fallback proxy: ${fallbackConfig.url}`);

            return originalAxiosRequest(fallbackConfig);
          });
      }

      // For non-API requests, use the original axios.request
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

            // Create a new config for the proxy request
            const proxyConfig = {
              method: 'POST',
              url: CUSTOM_PROXY_URL,
              data: {
                url: config.url,
                method: config.method || 'GET',
                data: config.data || null,
                headers: config.headers || {}
              },
              headers: {
                'Content-Type': 'application/json'
              }
            };

            console.log(`Using custom CORS proxy: ${CUSTOM_PROXY_URL}`);

            // Return a promise that tries the custom proxy first, then falls back to the third-party proxy
            return originalAxiosRequest(proxyConfig)
              .catch(error => {
                console.error(`Custom proxy failed: ${error.message}`);
                console.log(`Falling back to third-party proxy: ${THIRD_PARTY_PROXY_URL}`);

                // Use the third-party CORS proxy as fallback
                const fallbackConfig = { ...config };
                fallbackConfig.url = `${THIRD_PARTY_PROXY_URL}${encodeURIComponent(config.url)}`;
                console.log(`Redirecting to fallback proxy: ${fallbackConfig.url}`);

                return originalAxiosRequest(fallbackConfig);
              });
          }

          // For non-API requests, use the original axios.request
          return originalAxiosRequest(config);
        };

        // Store the patched axios
        this._axios = axios;
      }
    });
  }

  // Store the original XMLHttpRequest.prototype.open method
  const originalOpen = XMLHttpRequest.prototype.open;
  const originalSend = XMLHttpRequest.prototype.send;

  // Override the XMLHttpRequest.prototype.open method
  XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
    // Store the original URL and method
    this._originalUrl = url;
    this._originalMethod = method;

    // Check if this is an API request
    if (typeof url === 'string' && url.includes(API_BASE_URL)) {
      console.log(`Intercepting XMLHttpRequest to: ${url}`);

      // Flag this request as needing proxy
      this._useCustomProxy = true;

      // Call the original open method with our custom proxy URL
      return originalOpen.call(this, 'POST', CUSTOM_PROXY_URL, async, user, password);
    }

    // For non-API requests, use the original open method
    return originalOpen.apply(this, arguments);
  };

  // Override the XMLHttpRequest.prototype.send method
  XMLHttpRequest.prototype.send = function(body) {
    // If this request needs to use our custom proxy
    if (this._useCustomProxy) {
      // Create the proxy request body
      const proxyBody = JSON.stringify({
        url: this._originalUrl,
        method: this._originalMethod,
        data: body ? JSON.parse(body) : null,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Set the correct content type for the proxy request
      this.setRequestHeader('Content-Type', 'application/json');

      // Call the original send method with the proxy body
      return originalSend.call(this, proxyBody);
    }

    // For non-API requests, use the original send method
    return originalSend.apply(this, arguments);
  };

  console.log('CORS Fix Script initialized successfully!');
})();
