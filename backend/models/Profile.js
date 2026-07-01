const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  firstName: {
    type: String,
    required: true
  },

  lastName: {
    type: String,
    required: true
  },

  promotion: {
    type: String,
    required: true
  },

  specialty: {
    type: String,
    required: true
  },

  currentLocation: {
    type: String,
    required: true
  },

  bio: String,

  skills: [String],

  avatar: String,

  // NEW
  avatarPath: String

}, { timestamps: true });

module.exports = mongoose.model('Profile', ProfileSchema);