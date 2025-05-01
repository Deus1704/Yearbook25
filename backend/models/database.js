const { connectDB, disconnectDB, mongoose } = require('./mongodb');
const Profile = require('./Profile');
const Confession = require('./Confession');
const Message = require('./Message');
const Memory = require('./Memory');

// Initialize the database
const init = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log('Database initialized successfully');
    return true;
  } catch (error) {
    console.error('Database initialization error:', error.message);
    throw error;
  }
};

// Close the database connection
const close = async () => {
  try {
    await disconnectDB();
    console.log('Database connection closed successfully');
    return true;
  } catch (error) {
    console.error('Error closing database connection:', error.message);
    return false;
  }
};

// Export the database functions and models
module.exports = {
  init,
  close,
  Profile,
  Confession,
  Message,
  Memory,
  mongoose
};