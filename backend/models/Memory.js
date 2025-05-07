const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Memory schema
const MemorySchema = new Schema({
  name: {
    type: String,
    default: 'Memory'
  },
  // Store image in two ways:
  // 1. Directly in MongoDB (for small images or fallback)
  image: {
    type: Buffer
  },
  contentType: {
    type: String
  },
  // 2. Reference to Google Drive (preferred for larger images)
  imageId: {
    type: String
  },
  imageUrl: {
    type: String
  },
  uploadedBy: {
    type: String
  },
  // Approval status for admin moderation
  approved: {
    type: Boolean,
    default: false
  },
  // Email of the admin who approved the image
  approvedBy: {
    type: String,
    default: null
  },
  // Timestamp when the image was approved
  approvedAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create and export the Memory model
module.exports = mongoose.model('Memory', MemorySchema);
