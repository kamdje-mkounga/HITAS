const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Doit correspondre exactement au nom de ton modèle User
  },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  promotion: { type: String, required: true },
  specialty: { type: String, required: true },
  currentLocation: { type: String, required: true },
  bio: { type: String },
  skills: { type: [String] },
  avatar: { type: String } // Enregistre le chemin de l'image (ex: /uploads/avatar-123.jpg)
}, { timestamps: true });

module.exports = mongoose.model('Profile', ProfileSchema);