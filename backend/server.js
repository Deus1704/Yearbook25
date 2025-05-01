const express = require('express');
const cors = require('cors');
const multer = require('multer');
require('dotenv').config();

// Import database
const db = require('./models/database');

const app = express();

// Middleware
// Configure CORS - more permissive configuration
// const allowedOrigins = process.env.NODE_ENV === 'production'
//   ? [
//       process.env.FRONTEND_URL || 'https://students.iitgn.ac.in',
//       'https://students.iitgn.ac.in',
//       'https://students.iitgn.ac.in/yearbook/2025',
//       'https://yearbook25.vercel.app',
//       'https://corsproxy.io'
//     ]
//   : ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001'];

// // Enable CORS for all routes
// app.use(cors({
//   origin: function(origin, callback) {
//     // Allow requests with no origin (like mobile apps, curl requests)
//     if (!origin) return callback(null, true);

//     // For development or debugging, you can allow all origins
//     if (process.env.CORS_ALLOW_ALL === 'true') {
//       return callback(null, true);
//     }

//     // Check if the origin is from corsproxy.io
//     if (origin && origin.includes('corsproxy.io')) {
//       console.log('Allowing corsproxy.io request:', origin);
//       return callback(null, true);
//     }

//     if (allowedOrigins.indexOf(origin) !== -1) {
//       callback(null, true);
//     } else {
//       console.log('CORS blocked origin:', origin);
//       // Still allow the request to go through for Vercel deployment
//       callback(null, true);
//     }
//   },
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token', 'Accept', 'Accept-Version', 'Content-Length', 'Content-MD5', 'Date', 'X-Api-Version', 'Origin']
// }));

app.use(cors({
  origin: ['https://students.iitgn.ac.in'],
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));

// Handle preflight requests
app.options('*', cors());

// Custom middleware to ensure CORS headers are set on every response
app.use((req, res, next) => {
  const origin = req.headers.origin;

  // For development or debugging, you can allow all origins
  if (process.env.CORS_ALLOW_ALL === 'true') {
    res.header('Access-Control-Allow-Origin', '*');
  } else if (origin && origin.includes('corsproxy.io')) {
    // Allow corsproxy.io requests
    console.log('Setting CORS headers for corsproxy.io request:', origin);
    res.header('Access-Control-Allow-Origin', origin);
  } else if (origin && allowedOrigins.includes(origin)) {
    // Set the specific origin that made the request
    res.header('Access-Control-Allow-Origin', origin);
  } else {
    // Default to allowing all origins for Vercel deployment
    res.header('Access-Control-Allow-Origin', '*');
  }

  // Set Vary header to indicate that the response varies based on Origin
  res.header('Vary', 'Origin');

  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-CSRF-Token, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version, Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400'); // 24 hours

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
    },
    render: {
      isRender: process.env.RENDER === 'true' ? 'true' : 'false',
      renderService: process.env.RENDER_SERVICE_NAME || 'not set',
      renderRegion: process.env.RENDER_REGION || 'not set'
    },
    vercel: {
      isVercel: process.env.VERCEL === '1' ? 'true' : 'false',
      vercelEnv: process.env.VERCEL_ENV || 'not set',
      region: process.env.VERCEL_REGION || 'not set'
    },
    allEnvVars: Object.keys(process.env).reduce((acc, key) => {
      // Don't include sensitive values, just the keys
      acc[key] = key.includes('SECRET') || key.includes('KEY') || key.includes('TOKEN') ? '[REDACTED]' : process.env[key];
      return acc;
    }, {})
  });
});

// Add a simple CORS test endpoint
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

// Add a root endpoint for health checks
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Yearbook25 API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Routes
const profileRoutes = require('./routes/profiles');
const confessionRoutes = require('./routes/confessions');
const messageRoutes = require('./routes/messages');
const memoryRoutes = require('./routes/memories');
const corsProxyRoutes = require('./routes/cors-proxy');

app.use('/api/profiles', profileRoutes);
app.use('/api/confessions', confessionRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/memories', memoryRoutes);
app.use('/api/cors-proxy', corsProxyRoutes);

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