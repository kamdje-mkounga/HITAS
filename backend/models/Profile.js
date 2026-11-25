const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },

  firstName: {
    type: String,
    required: function () { return this.isNew; },
    trim: true
  },

  lastName: {
    type: String,
    required: function () { return this.isNew; },
    trim: true
  },

  promotion: {
    type: String,
    required: function () { return this.isNew; },
    trim: true
  },

  specialty: {
    type: String,
    required: function () { return this.isNew; },
    trim: true
  },

  // --- LOCALISATION ---
  currentLocation: {
    type: String,
    required: function () { return this.isNew; },
    trim: true
  },
  country: {
    type: String,
    default: '',
    trim: true
  },
  city: {
    type: String,
    default: '',
    trim: true
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
    default: '', // Entreprise ou Université / Établissement actuel
    trim: true
  },

  jobTitle: {
    type: String,
    default: '', // Intitulé du poste ou de la formation
    trim: true
  },

  // --- INFOS GÉNÉRALES & MÉDIAS ---
  bio: {
    type: String,
    default: '',
    trim: true
  },

  skills: {
    type: [String],
    default: []
  },

  avatar: {
    type: String,
    default: ''
  },

  avatarPath: {
    type: String,
    default: ''
  },

  // --- RÉSEAUX SOCIAUX & CONTACT (Optionnel pour un annuaire complet) ---
  socials: {
    linkedin: { type: String, default: '' },
    github: { type: String, default: '' },
    website: { type: String, default: '' }
  }

}, { timestamps: true });

module.exports = mongoose.model('Profile', ProfileSchema);