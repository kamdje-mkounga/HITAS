const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { sendResetEmail } = require('../utils/mailer');

// Helper: Normalize email
const normalizeEmail = (email) => {
    return email.trim().toLowerCase();
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// @route   POST api/auth/register
// @desc    Register a new student/alumni (Pending admin approval)
// @access  Public
router.post('/register', async (req, res) => {
    const { email, password, role } = req.body;

    try {
        // 1. Validate required fields
        if (!email || !password) {
            return res.status(400).json({
                message: "L'adresse email et le mot de passe sont obligatoires."
            });
        }

        if (typeof email !== 'string' || typeof password !== 'string') {
            return res.status(400).json({
                message: "Format des données invalide."
            });
        }

        const normalizedEmail = normalizeEmail(email);

        // 2. Validate email format
        if (!emailRegex.test(normalizedEmail)) {
            return res.status(400).json({
                message: "Veuillez fournir une adresse email valide."
            });
        }

        // 3. Validate password length
        if (password.length < 6 || !password.trim()) {
            return res.status(400).json({
                message: "Le mot de passe doit faire au moins 6 caractères."
            });
        }

        // 4. Prevent public admin registration
        const assignedRole = role === 'alumni' ? 'alumni' : 'student';

        // 5. Check if user already exists
        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(400).json({
                message: "Cet utilisateur existe déjà."
            });
        }

        // 6. Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // 7. Create user
        const user = new User({
            email: normalizedEmail,
            password: hashedPassword,
            role: assignedRole,

            // Account verification
            isVerified: false,

            // Registration tracking
            createdBy: null,
            registrationSource: 'public_signup',
            registrationIP: req.ip
        });

        // 8. Save user
        await user.save();

        // 9. Return response (No JWT before admin approval)
        return res.status(201).json({
            message: "Inscription enregistrée avec succès ! Votre compte est en attente de validation",
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified,
                registrationSource: user.registrationSource,
                createdAt: user.createdAt
            }
        });

    } catch (error) {

        // Handle duplicate email race condition
        if (error.code === 11000) {
            return res.status(400).json({
                message: "Cet utilisateur existe déjà."
            });
        }

        console.error("Registration error:", error);

        return res.status(500).json({
            message: "Erreur serveur lors de l'inscription."
        });
    }
});


// @route   POST api/auth/login
// @desc    Login student/alumni and generate JWT if verified
// @access  Public
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Validate input
        if (!email || !password) {
            return res.status(400).json({
                message: "L'adresse email et le mot de passe sont obligatoires."
            });
        }

        if (typeof email !== 'string' || typeof password !== 'string') {
            return res.status(400).json({
                message: "Format des données invalide."
            });
        }

        const normalizedEmail = normalizeEmail(email);

        // 2. Find user
        const user = await User.findOne({
            email: normalizedEmail
        });

        if (!user) {
            return res.status(400).json({
                message: "Identifiants invalides."
            });
        }

        // 3. Compare password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({
                message: "Identifiants invalides."
            });
        }

        // 4. Check account verification
        if (!user.isVerified && user.role !== 'admin') {
            return res.status(403).json({
                message: "Votre compte est en attente de validation. Vous ne pouvez pas encore vous connecter."
            });
        }

        // 5. Require JWT secret
        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is missing from environment variables.");

            return res.status(500).json({
                message: "Erreur de configuration du serveur."
            });
        }

        // 6. Generate JWT
        const payload = {
            userId: user.id,
            role: user.role
        };

        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // 7. Return authenticated user
        return res.json({
            message: "Connexion réussie !",
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified
            }
        });

    } catch (error) {

        console.error("Login error:", error);

        return res.status(500).json({
            message: "Erreur serveur lors de la connexion."
        });
    }
});


// @route   POST api/auth/forgot-password
// @desc    Send password reset link via email
// @access  Public
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    const genericResponse = {
        message: "Si un compte existe avec cette adresse email, un lien de réinitialisation a été envoyé."
    };

    try {
        if (!email || typeof email !== 'string') {
            return res.status(400).json({
                message: "L'adresse email est obligatoire."
            });
        }

        const normalizedEmail = normalizeEmail(email);

        if (!emailRegex.test(normalizedEmail)) {
            return res.status(400).json({
                message: "Veuillez fournir une adresse email valide."
            });
        }

        const user = await User.findOne({ email: normalizedEmail });

        if (user) {
            const rawToken = crypto.randomBytes(32).toString('hex');
            const hashedToken = crypto
                .createHash('sha256')
                .update(rawToken)
                .digest('hex');

            user.resetPasswordToken = hashedToken;
            user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
            await user.save();

            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            const resetUrl = `${frontendUrl}/reset-password?token=${rawToken}`;

            try {
                await sendResetEmail(user.email, resetUrl);
            } catch (mailError) {
                console.error("Reset email delivery error:", mailError);
            }
        }

        return res.status(200).json(genericResponse);

    } catch (error) {
        console.error("Forgot password error:", error);

        return res.status(500).json({
            message: "Erreur serveur lors de la demande de réinitialisation."
        });
    }
});


// @route   POST api/auth/reset-password
// @desc    Reset user password using valid token
// @access  Public
router.post('/reset-password', async (req, res) => {
    const { token, password } = req.body;

    try {
        if (!token || typeof token !== 'string' || !password || typeof password !== 'string') {
            return res.status(400).json({
                message: "Le token et le nouveau mot de passe sont obligatoires."
            });
        }

        if (password.length < 6 || !password.trim()) {
            return res.status(400).json({
                message: "Le mot de passe doit faire au moins 6 caractères."
            });
        }

        const hashedToken = crypto
            .createHash('sha256')
            .update(token.trim())
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: new Date() }
        });

        if (!user) {
            return res.status(400).json({
                message: "Le lien de réinitialisation est invalide ou a expiré."
            });
        }

        user.password = await bcrypt.hash(password, 12);
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();

        return res.status(200).json({
            message: "Mot de passe réinitialisé avec succès ! Vous pouvez maintenant vous connecter."
        });

    } catch (error) {
        console.error("Reset password error:", error);

        return res.status(500).json({
            message: "Erreur serveur lors de la réinitialisation du mot de passe."
        });
    }
});


// @route   PUT /api/auth/fcm-token
// @desc    Register Firebase token for authenticated user
// @access  Private
router.put('/fcm-token', auth, async (req, res) => {

    try {
        const { token } = req.body;

        // 1. Validate token
        if (!token || typeof token !== 'string' || !token.trim()) {
            return res.status(400).json({
                message: "Token Firebase invalide."
            });
        }

        const cleanToken = token.trim();

        // 2. Find authenticated user
        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({
                message: "Utilisateur introuvable."
            });
        }

        // 3. Prevent duplicate tokens
        if (!user.fcmTokens.includes(cleanToken)) {
            user.fcmTokens.push(cleanToken);

            await user.save();
        }

        return res.json({
            success: true,
            message: "Token Firebase enregistré avec succès."
        });

    } catch (error) {

        console.error("FCM token error:", error);

        return res.status(500).json({
            message: "Erreur serveur lors de l'enregistrement du token Firebase."
        });
    }
});

module.exports = router;