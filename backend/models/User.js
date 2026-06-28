const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "L'adresse email est obligatoire"],
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: [true, "Le mot de passe est obligatoire"],
        minlength: [6, "Le mot de passe doit faire au moins 6 caractères"]
    },
    role: {
        type: String,
        enum: ['student', 'alumni', 'admin'],
        default: 'student'
    },
    isVerified: {
        type: Boolean,
        default: false // Le président ou l'admin pourra passer à true pour valider l'étudiant
    }
}, {
    timestamps: true // Crée automatiquement les champs createdAt et updatedAt
});

module.exports = mongoose.model('User', UserSchema);