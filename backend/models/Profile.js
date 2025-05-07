const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Profile schema
const ProfileSchema = new Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  department: {
    type: String,
    required: true
  },
  degree: {
    type: String,
    required: true
  },
  quote: {
    type: String,
    default: ''
  },
  // Store image in two ways:
  // 1. Directly in MongoDB (for small images or fallback)
  image: {
    type: Buffer,
    contentType: String
  },
  // 2. Reference to Google Drive (preferred for larger images)
  imageId: {
    type: String
  },
  imageUrl: {
    type: String
  },
  comments: [{
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
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create and export the Profile model
module.exports = mongoose.model('Profile', ProfileSchema);
