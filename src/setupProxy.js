const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Proxy API requests to the backend server
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://yearbook25-xb9a.onrender.com',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '/api', // No rewrite needed
      },
      // Handle redirects to Google Drive URLs
      onProxyRes: function(proxyRes, req, res) {
        // If the response is a redirect to Google Drive
        if (proxyRes.headers.location && 
            (proxyRes.headers.location.includes('drive.google.com') || 
             proxyRes.headers.location.includes('googleusercontent.com'))) {
          
          console.log('Intercepted redirect to Google Drive URL:', proxyRes.headers.location);
          
          // Instead of redirecting, pass through the Google Drive URL
          // The client will handle fetching from this URL directly
          res.setHeader('X-Google-Drive-URL', proxyRes.headers.location);
          res.setHeader('Access-Control-Expose-Headers', 'X-Google-Drive-URL');
          
          // Remove the redirect
          delete proxyRes.headers.location;
        }
      },
      onError: (err, req, res) => {
        console.error('Proxy error:', err);
        res.writeHead(500, {
          'Content-Type': 'text/plain',
        });
        res.end('Proxy error: ' + err.message);
      },
    })
  );
};
