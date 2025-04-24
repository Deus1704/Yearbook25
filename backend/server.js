const express = require('express');
const cors = require('cors');
const multer = require('multer');
require('dotenv').config();

const app = express();

// Middleware
// Configure CORS based on environment
const corsOptions = {
  credentials: true
};

// In development, restrict to localhost origins
if (process.env.NODE_ENV === 'development') {
  corsOptions.origin = ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001'];
} else {
  // In production, allow requests from the frontend domain
  // You can specify your frontend domain here or use '*' to allow all domains
  // Example: corsOptions.origin = 'https://your-frontend-domain.com';
  corsOptions.origin = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*';
}

app.use(cors(corsOptions));
app.use(express.json());

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
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));