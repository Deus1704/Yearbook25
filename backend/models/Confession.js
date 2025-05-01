const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Confession schema
const ConfessionSchema = new Schema({
  text: {
    type: String,
    required: true
  },
  anonymous: {
    type: Boolean,
    default: true
  },
  userId: {
    type: String
  },
  name: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create and export the Confession model
module.exports = mongoose.model('Confession', ConfessionSchema);
