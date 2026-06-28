const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  techStack: {
    type: [String], // Tableau de chaînes de caractères
    default: []
  },
  githubLink: {
    type: String
  },
  demoLink: {
    type: String
  },
  // 👇 On remplace "author" par "user" pour être raccord avec le reste du projet
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('project', ProjectSchema);