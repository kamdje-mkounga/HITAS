const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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

  // --- LOCALISATION ---
  currentLocation: {
    type: String,
    required: true
  },
  country: {
    type: String,
    default: ''
  },
  city: {
    type: String,
    default: ''
  },

  // --- PARCOURS ACADÉMIQUE & PROFESSIONNEL ---
  status: {
    type: String,
    enum: ['Étudiant', 'En poste', 'En recherche de stage', 'Indépendant / Freelance', 'En poursuite d\'études', 'Autre', ''],
    default: 'Étudiant'
  },

  degreeLevel: {
    type: String,
    enum: ['Licence', 'Master', 'Doctorat', 'Alumni', 'Autre', ''],
    default: 'Licence'
  },

  currentCompany: {
    type: String,
    default: '' // Entreprise ou Université / Établissement actuel
  },

  jobTitle: {
    type: String,
    default: '' // Intitulé du poste ou de la formation
  },

  // --- INFOS GÉNÉRALES & MÉDIAS ---
  bio: String,

  skills: [String],

  avatar: String,

  avatarPath: String,

  // --- RÉSEAUX SOCIAUX & CONTACT (Optionnel pour un annuaire complet) ---
  socials: {
    linkedin: { type: String, default: '' },
    github: { type: String, default: '' },
    website: { type: String, default: '' }
  }

}, { timestamps: true });

module.exports = mongoose.model('Profile', ProfileSchema);