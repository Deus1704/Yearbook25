const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Message schema
const MessageSchema = new Schema({
  userId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create and export the Message model
module.exports = mongoose.model('Message', MessageSchema);
