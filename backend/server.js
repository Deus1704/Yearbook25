const express = require('express');
const cors = require('cors');
const multer = require('multer');
require('dotenv').config();

// Import database
const db = require('./models/database');

const app = express();

// Middleware
// Configure CORS - more permissive configuration
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [process.env.FRONTEND_URL || 'https://yearbook25.com', 'https://students.iitgn.ac.in', 'https://students.iitgn.ac.in/yearbook/2025']
  : ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001'];

// Enable CORS for all routes
app.use(cors({
  origin: '*', // Allow all origins temporarily for debugging
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Handle preflight requests
app.options('*', cors());

// Custom middleware to ensure CORS headers are set on every response
app.use((req, res, next) => {
  // Set CORS headers for all responses
  res.header('Access-Control-Allow-Origin', '*'); // Allow all origins temporarily
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
});

// Add a middleware to log all requests for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Headers:', JSON.stringify(req.headers));
  next();
});

// Add a middleware to bypass authentication for public endpoints
app.use((req, res, next) => {
  // List of paths that should be publicly accessible
  const publicPaths = [
    '/cors-test',
    '/api/cors-debug',
    '/',
    '/api/profiles',
    '/api/confessions',
    '/api/messages',
    '/api/memories'
  ];

  // Check if the request path starts with any of the public paths
  const isPublicPath = publicPaths.some(path => req.path.startsWith(path));

  if (isPublicPath) {
    // For public paths, bypass any authentication
    console.log(`Public path accessed: ${req.path}`);
  }

  next();
});
app.use(express.json());

// Add a simple health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Yearbook25 API is running' });
});

// Add a public CORS test endpoint that doesn't require authentication
app.get('/cors-test', (req, res) => {
  res.json({
    status: 'ok',
    message: 'CORS test endpoint',
    cors: 'enabled',
    headers: req.headers,
    origin: req.headers.origin || 'No origin header'
  });
});

// Add a CORS debug endpoint
app.get('/api/cors-debug', (req, res) => {
  res.json({
    status: 'ok',
    message: 'CORS debug endpoint',
    requestHeaders: req.headers,
    responseHeaders: res.getHeaders(),
    allowedOrigins: allowedOrigins,
    env: {
      nodeEnv: process.env.NODE_ENV,
      frontendUrl: process.env.FRONTEND_URL,
      port: process.env.PORT
    },
    vercel: process.env.VERCEL === '1' ? 'true' : 'false',
    vercelEnv: process.env.VERCEL_ENV || 'not set'
  });
});

// Routes
const profileRoutes = require('./routes/profiles');
const confessionRoutes = require('./routes/confessions');
const messageRoutes = require('./routes/messages');
const memoryRoutes = require('./routes/memories');

app.use('/api/profiles', profileRoutes);
app.use('/api/confessions', confessionRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/memories', memoryRoutes);

const PORT = process.env.PORT || 5000;

// Initialize the database before starting the server
async function startServer() {
  try {
    // Initialize the database
    await db.init();

    // Start the server
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();