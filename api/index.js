// API index file
const corsProxy = require('./cors-proxy');

module.exports = (req, res) => {
  // Forward all requests to the CORS proxy
  return corsProxy(req, res);
};
