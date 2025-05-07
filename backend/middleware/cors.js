/**
 * CORS Middleware
 * 
 * This middleware provides comprehensive CORS handling for the Yearbook25 API.
 * It ensures that all necessary CORS headers are set correctly for both regular
 * requests and preflight OPTIONS requests.
 */

const cors = require('cors');

// Create a comprehensive CORS middleware with expanded allowed headers
const corsMiddleware = cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With', 
    'Access-Control-Allow-Origin',
    'Access-Control-Allow-Methods',
    'Access-Control-Allow-Headers',
    'Access-Control-Allow-Credentials',
    'Origin',
    'Accept',
    'X-Requested-With',
    'X-CSRF-Token'
  ],
  exposedHeaders: [
    'Access-Control-Allow-Origin',
    'Access-Control-Allow-Methods',
    'Access-Control-Allow-Headers'
  ],
  credentials: true,
  maxAge: 86400 // 24 hours
});

// Additional CORS headers middleware to handle edge cases
const additionalCorsHeaders = (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Methods, Access-Control-Allow-Origin, Access-Control-Allow-Headers');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
};

// Preflight handler for OPTIONS requests
const preflightHandler = (req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Methods, Access-Control-Allow-Origin, Access-Control-Allow-Headers');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '86400');
    return res.status(200).end();
  }
  next();
};

// Export all middleware functions
module.exports = {
  corsMiddleware,
  additionalCorsHeaders,
  preflightHandler
};
