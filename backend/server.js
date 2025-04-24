const express = require('express');
const cors = require('cors');
const multer = require('multer');
require('dotenv').config();

// Import database
const db = require('./models/database');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? [process.env.FRONTEND_URL || 'https://yearbook25.com']
    : ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001'],
  credentials: true
}));
app.use(express.json());

// Add a simple health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Yearbook25 API is running' });
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