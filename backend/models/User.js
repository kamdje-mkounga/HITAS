
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({

    // User email
    email: {
        type: String,
        required: [true, "L'adresse email est obligatoire"],
        unique: true,
        trim: true,
        lowercase: true
    },

    // Hashed password
    password: {
        type: String,
        required: [true, "Le mot de passe est obligatoire"],
        minlength: [6, "Le mot de passe doit faire au moins 6 caractères"]
    },

    // User role
    role: {
        type: String,
        enum: ['student', 'alumni', 'admin'],
        default: 'student'
    },

    // Email verification status
    isVerified: {
        type: Boolean,
        default: false
    },

    // Firebase Cloud Messaging tokens
    fcmTokens: {
        type: [String],
        default: []
    },

    // Account creation tracking
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },

    // Account registration method
    registrationSource: {
        type: String,
        enum: ['public_signup', 'admin_creation', 'system'],
        default: 'public_signup'
    },

    // IP address used during registration
    registrationIP: {
        type: String,
        default: null
    }

}, {
    timestamps: true
});

// Export User model
module.exports = mongoose.model('User', UserSchema);
