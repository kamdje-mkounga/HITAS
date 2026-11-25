const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Profile = require('../models/Profile');
const auth = require('../middleware/auth');
const { sendResetEmail } = require('../utils/mailer');

// Helper: Normalize email
const normalizeEmail = (email) => email.trim().toLowerCase();

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Helper: Normalize string array (from array or comma-separated string)
const normalizeSkills = (skills) => {
    if (Array.isArray(skills)) {
        return skills.map((s) => String(s).trim()).filter(Boolean);
    }
    if (typeof skills === 'string') {
        return skills.split(',').map((s) => s.trim()).filter(Boolean);
    }
    return [];
};

// @route   POST api/auth/register
// @desc    Register a new student/alumni with full profile info in one step (Pending admin approval)
// @access  Public
router.post('/register', async (req, res) => {
    const {
        email,
        password,
        role,
        firstName,
        lastName,
        promotion,
        specialty,
        currentLocation,
        country,
        city,
        status,
        degreeLevel,
        currentCompany,
        jobTitle,
        bio,
        skills,
        avatar,
        avatarPath,
        socials
    } = req.body;

    let createdUser = null;

    try {
        // 1. Validate required account & profile fields
        if (
            !email ||
            !password ||
            !firstName ||
            !lastName ||
            !promotion ||
            !specialty ||
            !currentLocation
        ) {
            return res.status(400).json({
                message: "Veuillez remplir tous les champs obligatoires (email, mot de passe, prénom, nom, promotion, spécialité et localisation)."
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
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(400).json({
                message: "Cet utilisateur existe déjà."
            });
        }

        // 6. Hash password & create User (pending admin verification)
        const hashedPassword = await bcrypt.hash(password, 12);

        createdUser = new User({
            email: normalizedEmail,
            password: hashedPassword,
            role: assignedRole,
            isVerified: false,
            approvalStatus: 'pending',
            rejectionReason: null,
            profileSubmitted: true,
            reviewedBy: null,
            reviewedAt: null,
            createdBy: null,
            registrationSource: 'public_signup',
            registrationIP: req.ip
        });

        await createdUser.save();

        // 7. Create complete Profile linked to User
        const profile = new Profile({
            user: createdUser._id,
            firstName: String(firstName).trim(),
            lastName: String(lastName).trim(),
            promotion: String(promotion).trim(),
            specialty: String(specialty).trim(),
            currentLocation: String(currentLocation).trim(),
            country: country ? String(country).trim() : '',
            city: city ? String(city).trim() : '',
            status: status || (assignedRole === 'alumni' ? 'En poste' : 'Étudiant'),
            degreeLevel: degreeLevel || (assignedRole === 'alumni' ? 'Alumni' : 'Licence'),
            currentCompany: currentCompany ? String(currentCompany).trim() : '',
            jobTitle: jobTitle ? String(jobTitle).trim() : '',
            bio: bio ? String(bio).trim() : '',
            skills: normalizeSkills(skills),
            avatar: avatar || '',
            avatarPath: avatarPath || '',
            socials: {
                linkedin: socials?.linkedin ? String(socials.linkedin).trim() : '',
                github: socials?.github ? String(socials.github).trim() : '',
                website: socials?.website ? String(socials.website).trim() : ''
            }
        });

        await profile.save();

        // 8. Return response (No JWT before admin approval)
        return res.status(201).json({
            message: "Inscription complète enregistrée ! Votre profil est en attente de validation par l'administrateur.",
            user: {
                id: createdUser._id,
                email: createdUser.email,
                role: createdUser.role,
                approvalStatus: createdUser.approvalStatus,
                profileSubmitted: createdUser.profileSubmitted,
                createdAt: createdUser.createdAt
            },
            profile: {
                id: profile._id,
                firstName: profile.firstName,
                lastName: profile.lastName,
                promotion: profile.promotion,
                specialty: profile.specialty,
                currentLocation: profile.currentLocation
            }
        });

    } catch (error) {
        // Roll back orphan User if Profile creation/validation fails
        if (createdUser && createdUser._id) {
            await User.findByIdAndDelete(createdUser._id).catch(() => { });
        }

        if (error.code === 11000) {
            return res.status(400).json({
                message: "Cet utilisateur existe déjà."
            });
        }

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((err) => err.message);
            return res.status(400).json({
                message: messages[0] || "Données d'inscription invalides."
            });
        }

        console.error("Registration error:", error);

        return res.status(500).json({
            message: "Erreur serveur lors de l'inscription."
        });
    }
});


// @route   POST api/auth/login
// @desc    Login student/alumni and generate JWT if approved by admin
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
        const user = await User.findOne({ email: normalizedEmail });

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

        // 4. Check admin approval status (default to 'approved' for legacy users without field)
        const effectiveStatus = user.approvalStatus || 'approved';

        if (user.role !== 'admin' && effectiveStatus !== 'approved') {
            if (effectiveStatus === 'rejected') {
                return res.status(403).json({
                    message: user.rejectionReason
                        ? `Votre demande d'inscription a été refusée : ${user.rejectionReason}`
                        : "Votre demande d'inscription a été refusée par l'administrateur.",
                    approvalStatus: 'rejected',
                    rejectionReason: user.rejectionReason || null
                });
            }

            return res.status(403).json({
                message: "Votre compte est en attente de validation par l'administrateur. Vous ne pouvez pas encore vous connecter.",
                approvalStatus: 'pending'
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
            userId: user._id,
            role: user.role
        };

        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        const profile = await Profile.findOne({ user: user._id }).lean();

        // 7. Return authenticated user
        return res.json({
            message: "Connexion réussie !",
            token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified,
                approvalStatus: effectiveStatus
            },
            profile: profile || null
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

        if (!token || typeof token !== 'string' || !token.trim()) {
            return res.status(400).json({
                message: "Token Firebase invalide."
            });
        }

        const cleanToken = token.trim();
        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({
                message: "Utilisateur introuvable."
            });
        }

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