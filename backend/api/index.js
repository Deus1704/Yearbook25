// Main API entry point for Vercel serverless functions
const express = require('express');
const cors = require('cors');
const app = express();

// Enable CORS for all routes with a more permissive configuration
app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));

// Handle preflight requests
app.options('*', cors());

// Add a simple health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Yearbook25 API is running' });
});

// Add a CORS test endpoint
app.get('/cors-test', (req, res) => {
  res.json({
    status: 'ok',
    message: 'CORS test successful',
    headers: req.headers,
    origin: req.headers.origin || 'No origin header'
  });
});

// Import routes
const profilesRoute = require('./routes/profiles');
const confessionsRoute = require('./routes/confessions');
const messagesRoute = require('./routes/messages');
const memoriesRoute = require('./routes/memories');

// Use routes
app.use('/profiles', profilesRoute);
app.use('/confessions', confessionsRoute);
app.use('/messages', messagesRoute);
app.use('/memories', memoriesRoute);

// Export the Express app as a serverless function
module.exports = app;
