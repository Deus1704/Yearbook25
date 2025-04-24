const express = require('express');
const cors = require('cors');
const multer = require('multer');
require('dotenv').config();

// Import database
const db = require('./models/database');

const app = express();

// Middleware
// Configure CORS
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [process.env.FRONTEND_URL || 'https://yearbook25.com', 'https://students.iitgn.ac.in']
  : ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001'];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) === -1) {
      console.log(`CORS blocked request from origin: ${origin}`);
      return callback(null, false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight requests
app.options('*', cors());

// Custom middleware to ensure CORS headers are set
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});
app.use(express.json());

// Add a simple health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Yearbook25 API is running' });
});

// Add a CORS debug endpoint
app.get('/api/cors-debug', (req, res) => {
  res.json({
    status: 'ok',
    message: 'CORS debug endpoint',
    headers: {
      origin: req.headers.origin,
      host: req.headers.host,
      referer: req.headers.referer
    },
    allowedOrigins: allowedOrigins,
    env: {
      nodeEnv: process.env.NODE_ENV,
      frontendUrl: process.env.FRONTEND_URL
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