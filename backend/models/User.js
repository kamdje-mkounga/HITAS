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

    // Email verification status (optional / separate from admin approval)
    isVerified: {
        type: Boolean,
        default: false
    },

    // Admin approval workflow status ('pending' -> 'approved' or 'rejected')
    approvalStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },

    // Reason provided by admin when denying/rejecting a registration
    rejectionReason: {
        type: String,
        default: null,
        trim: true
    },

    // Tracks whether complete onboarding/profile info was submitted in one step
    profileSubmitted: {
        type: Boolean,
        default: false
    },

    // Admin audit fields
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },

    reviewedAt: {
        type: Date,
        default: null
    },

    // Password reset token (stored as SHA-256 hash)
    resetPasswordToken: {
        type: String,
        default: null
    },

    // Password reset expiration timestamp
    resetPasswordExpires: {
        type: Date,
        default: null
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

module.exports = mongoose.model('User', UserSchema);