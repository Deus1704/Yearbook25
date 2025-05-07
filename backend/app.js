// Importing all the libraries
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const multer = require('multer');
const cors = require('cors');
const { google } = require('googleapis');
const streamifier = require('streamifier');
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Import database
const db = require('./models/database');
const fileStorage = require('./services/fileStorage');

dotenv.config();

const app = express();

// Configure CORS - more permissive configuration for production
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [
      process.env.FRONTEND_URL || 'https://students.iitgn.ac.in',
      'https://students.iitgn.ac.in',
      'https://students.iitgn.ac.in/yearbook/2025',
      'https://students.iitgn.ac.in/yearbook',
      'https://yearbook25-xb9a.onrender.com',
    ]
  : ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001'];

// Comprehensive CORS middleware
app.use(cors({
  origin: '*', // Allow all origins in development and testing
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));

// Handle preflight requests
app.options('*', cors());

// Add a middleware to log all requests for debugging
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Headers:', JSON.stringify(req.headers));
  next();
});

// Middleware
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Add a simple health check endpoint
app.get('/', (_req, res) => {
  res.json({ status: 'ok', message: 'Yearbook25 API is running' });
});

// Add a CORS test endpoint
app.get('/cors-test', (req, res) => {
  res.json({
    status: 'success',
    message: 'CORS test successful',
    timestamp: new Date().toISOString(),
    origin: req.headers.origin || 'No origin header',
    host: req.headers.host,
    method: req.method
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
    corsAllowAll: process.env.CORS_ALLOW_ALL === 'true' ? 'true' : 'false',
    originCheck: {
      requestOrigin: req.headers.origin || 'No origin header',
      isAllowed: !req.headers.origin || allowedOrigins.includes(req.headers.origin) || process.env.CORS_ALLOW_ALL === 'true'
    },
    env: {
      nodeEnv: process.env.NODE_ENV,
      frontendUrl: process.env.FRONTEND_URL,
      port: process.env.PORT,
      corsAllowAll: process.env.CORS_ALLOW_ALL
    }
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

// Catch-all route to serve the React app for client-side routing
// Only enable this if you're serving the frontend from the same server
if (process.env.SERVE_FRONTEND === 'true') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;

// Initialize the database before starting the server
async function startServer() {
  try {
    // Initialize the database
    await db.init();

    // Start the server
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('Failed to initialize with Google Drive:', err);
    console.log('Starting server in basic mode without Google Drive integration...');

    // Start the server anyway without Google Drive
    app.listen(PORT, () => console.log(`Server running on port ${PORT} (basic mode)`));
  }
}

startServer();

module.exports = app; // Export for testing or serverless functions
