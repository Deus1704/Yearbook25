/**
 * CORS Fix Script for Yearbook25
 * This script helps handle CORS issues with Google Drive images
 */

(function() {
  // Store original fetch
  const originalFetch = window.fetch;

  // Helper function to check if a URL is a Google Drive URL
  const isGoogleDriveUrl = (url) => {
    return url.includes('drive.google.com') || 
           url.includes('googleusercontent.com') || 
           url.includes('docs.google.com');
  };

  // Helper function to extract Google Drive file ID
  const extractGoogleDriveFileId = (url) => {
    if (!url) return null;
    
    // Match patterns like id=FILE_ID or /d/FILE_ID/
    const idMatch = url.match(/id=([^&]+)/) || url.match(/\/d\/([^/]+)/);
    if (idMatch && idMatch[1]) {
      return idMatch[1];
    }
    
    return null;
  };

  // Helper function to get optimized Google Drive URL
  const getOptimizedGoogleDriveUrl = (url) => {
    const fileId = extractGoogleDriveFileId(url);
    if (!fileId) return url;
    
    // Use the most reliable format
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  };

  // Override fetch to handle Google Drive URLs
  window.fetch = function(resource, options) {
    let url = resource;
    
    // If resource is a Request object, get the URL
    if (resource instanceof Request) {
      url = resource.url;
    }
    
    // If it's a Google Drive URL, optimize it
    if (typeof url === 'string' && isGoogleDriveUrl(url)) {
      const optimizedUrl = getOptimizedGoogleDriveUrl(url);
      
      // If resource is a string, just replace it
      if (typeof resource === 'string') {
        return originalFetch(optimizedUrl, options);
      }
      
      // If resource is a Request object, create a new one with the optimized URL
      const newRequest = new Request(optimizedUrl, {
        method: resource.method,
        headers: resource.headers,
        body: resource.body,
        mode: 'cors',
        credentials: 'omit',
        cache: 'no-store',
        redirect: 'follow'
      });
      
      return originalFetch(newRequest, options);
    }
    
    // For API requests that might redirect to Google Drive, add special handling
    if (typeof url === 'string' && url.includes('/api/memories/') && url.includes('/image')) {
      // Create options if not provided
      options = options || {};
      
      // Ensure we're using 'cors' mode and not following redirects
      const newOptions = {
        ...options,
        mode: 'cors',
        redirect: 'manual',
        cache: 'no-store'
      };
      
      return originalFetch(resource, newOptions)
        .then(response => {
          // If we got a redirect to Google Drive, follow it with our optimized URL
          if (response.type === 'opaqueredirect' || response.status === 302 || response.status === 307) {
            const location = response.headers.get('Location');
            if (location && isGoogleDriveUrl(location)) {
              const optimizedUrl = getOptimizedGoogleDriveUrl(location);
              return originalFetch(optimizedUrl, {
                mode: 'cors',
                credentials: 'omit',
                cache: 'no-store'
              });
            }
          }
          return response;
        });
    }
    
    // For all other requests, use the original fetch
    return originalFetch(resource, options);
  };

  // Override Image.prototype.src to handle Google Drive URLs
  const originalSrcDescriptor = Object.getOwnPropertyDescriptor(Image.prototype, 'src');
  if (originalSrcDescriptor && originalSrcDescriptor.set) {
    Object.defineProperty(Image.prototype, 'src', {
      get: originalSrcDescriptor.get,
      set: function(url) {
        if (typeof url === 'string' && isGoogleDriveUrl(url)) {
          const optimizedUrl = getOptimizedGoogleDriveUrl(url);
          originalSrcDescriptor.set.call(this, optimizedUrl);
        } else {
          originalSrcDescriptor.set.call(this, url);
        }
      }
    });
  }

  // Add a global cache for images
  window.imageCache = new Map();

  // Log that the CORS fix script has loaded
  console.log('CORS Fix Script loaded successfully');
})();
