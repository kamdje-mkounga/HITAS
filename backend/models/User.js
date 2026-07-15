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
        default: false
    },

    // 🔔 Token Firebase
    fcmToken: {
        type: [String],
        default: []
    }

}, {
    timestamps: true
});

module.exports = mongoose.model('User', UserSchema);