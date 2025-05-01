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
  image: {
    type: Buffer,
    contentType: String
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
