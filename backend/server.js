const express = require('express');
const multer = require('multer');
const path = require('path');
const bodyParser = require('body-parser');
require('dotenv').config();

// Import database manager, backup scheduler, auto-restore service, and scheduled tasks
const dbManager = require('./models/database-manager');
const backupScheduler = require('./scripts/schedule-backup');
const autoRestoreService = require('./services/autoRestoreService');
const scheduledTasks = require('./services/scheduledTasks');

const app = express();

// Middleware
// Configure CORS - more permissive configuration
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [
      process.env.FRONTEND_URL || 'https://students.iitgn.ac.in',
      'https://students.iitgn.ac.in',
      'https://students.iitgn.ac.in/yearbook/2025',
      'https://students.iitgn.ac.in/yearbook',
      'https://yearbook25-xb9a.onrender.com',
    ]
  : ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001'];

// Comprehensive CORS middleware that allows all origins and handles preflight requests
app.use((req, res, next) => {
  // Allow requests from any origin
  res.header('Access-Control-Allow-Origin', '*');

  // Allow specific methods
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');

  // Allow specific headers - expanded list to include all common headers
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-CSRF-Token, X-Api-Version');

  // Allow credentials
  res.header('Access-Control-Allow-Credentials', 'true');

  // Set max age for preflight requests
  res.header('Access-Control-Max-Age', '86400'); // 24 hours

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
});

// Add a middleware to log all requests for debugging
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Headers:', JSON.stringify(req.headers));
  next();
});

// Add a middleware to bypass authentication for public endpoints
app.use((req, _res, next) => {
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
app.get('/', (_req, res) => {
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



// Get routes based on database type
const routes = dbManager.getRoutes();
const corsProxyRoutes = require('./routes/cors-proxy');
const backupRoutes = require('./routes/backups');
const notificationRoutes = require('./routes/notifications');

// Use routes
app.use('/api/profiles', routes.profiles);
app.use('/api/confessions', routes.confessions);
app.use('/api/messages', routes.messages);
app.use('/api/memories', routes.memories);
app.use('/api/cors-proxy', corsProxyRoutes);
app.use('/api/backups', backupRoutes);
app.use('/api/notifications', notificationRoutes);

const PORT = process.env.PORT || 5000;

// Initialize the database before starting the server
async function startServer() {
  try {
    // Initialize the database
    await dbManager.init();

    // Log which database is being used
    console.log(`Using ${dbManager.USE_MONGODB ? 'MongoDB' : 'SQLite'} database`);

    // Try to restore from the most recent backup first
    try {
      const restored = await autoRestoreService.initAutoRestore();
      if (restored) {
        console.log('Successfully restored data from the most recent backup');
      } else {
        console.log('No auto-restore performed, using existing database');
      }
    } catch (restoreErr) {
      console.error('Warning: Failed to auto-restore from backup:', restoreErr.message);
      console.log('Continuing with existing database');
    }

    // Initialize backup service and schedule backups
    try {
      await backupScheduler.initializeBackupService();

      // Schedule automatic backups if enabled
      if (process.env.ENABLE_AUTO_BACKUPS === 'true') {
        backupScheduler.scheduleBackups();
      } else {
        console.log('Automatic backups are disabled. Set ENABLE_AUTO_BACKUPS=true to enable.');
      }
    } catch (backupErr) {
      console.error('Warning: Failed to initialize backup service:', backupErr.message);
      console.log('Server will run without automatic backups');
    }

    // Initialize scheduled tasks
    try {
      scheduledTasks.initScheduledTasks();
      console.log('Scheduled tasks initialized successfully');
    } catch (tasksErr) {
      console.error('Warning: Failed to initialize scheduled tasks:', tasksErr.message);
      console.log('Server will run without scheduled tasks');
    }

    // Start the server
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('Failed to initialize database:', err);
    console.log('Starting server in basic mode without database integration...');

    // Start the server anyway without database
    app.listen(PORT, () => console.log(`Server running on port ${PORT} (basic mode)`));
  }
}

// Add a command line argument to migrate data if needed
if (process.argv.includes('--migrate-to-mongodb')) {
  (async () => {
    try {
      console.log('Starting migration from SQLite to MongoDB...');
      const result = await dbManager.migrateToMongoDB();
      if (result) {
        console.log('Migration completed successfully');
      } else {
        console.error('Migration failed');
      }
      process.exit(result ? 0 : 1);
    } catch (error) {
      console.error('Migration error:', error);
      process.exit(1);
    }
  })();
} else {
  startServer();
}