const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Memory schema
const MemorySchema = new Schema({
  name: {
    type: String,
    default: 'Memory'
  },
  image: {
    type: Buffer,
    required: true
  },
  contentType: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create and export the Memory model
module.exports = mongoose.model('Memory', MemorySchema);
