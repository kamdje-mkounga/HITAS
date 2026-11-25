const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Profile = require('../models/Profile');

// 🔒 MIDDLEWARE DE SÉCURITÉ : Vérifie si l'utilisateur est connecté et ADMIN
const isAdmin = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: "Accès refusé. Aucun token fourni." });
        }

        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is missing from environment variables.");
            return res.status(500).json({ message: "Erreur de configuration du serveur." });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.userId);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ message: "Accès refusé. Privilèges administrateur requis." });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Token invalide ou expiré." });
    }
};

// Helper: Attach Profile documents to an array of User documents
const attachProfiles = async (users) => {
    if (!users.length) return [];
    const userIds = users.map((u) => u._id);
    const profiles = await Profile.find({ user: { $in: userIds } }).lean();
    const profileMap = new Map(profiles.map((p) => [String(p.user), p]));

    return users.map((u) => ({
        ...u.toObject(),
        profile: profileMap.get(String(u._id)) || null
    }));
};

// @route   GET api/admin/users
// @desc    Obtenir la liste de tous les utilisateurs avec leur profil
// @access  Private (Admin)
router.get('/users', isAdmin, async (req, res) => {
    try {
        const { approvalStatus } = req.query;
        const filter = {};

        if (approvalStatus && ['pending', 'approved', 'rejected'].includes(approvalStatus)) {
            filter.approvalStatus = approvalStatus;
        }

        const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
        const usersWithProfiles = await attachProfiles(users);
        res.json(usersWithProfiles);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Erreur lors de la récupération des utilisateurs." });
    }
});

// @route   GET api/admin/pending-users
// @desc    Obtenir les inscriptions en attente de validation avec leurs profils complets
// @access  Private (Admin)
router.get('/pending-users', isAdmin, async (req, res) => {
    try {
        const pendingUsers = await User.find({
            role: { $ne: 'admin' },
            approvalStatus: 'pending'
        })
            .select('-password')
            .sort({ createdAt: 1 });

        const usersWithProfiles = await attachProfiles(pendingUsers);
        res.json(usersWithProfiles);
    } catch (error) {
        console.error("Error fetching pending users:", error);
        res.status(500).json({ message: "Erreur lors de la récupération des demandes en attente." });
    }
});

// @route   PUT api/admin/review-user/:id
// @desc    Approuver ('approved') ou refuser ('rejected') l'inscription d'un utilisateur
// @access  Private (Admin)
router.put('/review-user/:id', isAdmin, async (req, res) => {
    const { decision, rejectionReason } = req.body;

    try {
        if (!['approved', 'rejected'].includes(decision)) {
            return res.status(400).json({
                message: "Décision invalide. Utilisez 'approved' ou 'rejected'."
            });
        }

        const isApproved = decision === 'approved';
        const cleanReason =
            !isApproved && typeof rejectionReason === 'string' && rejectionReason.trim()
                ? rejectionReason.trim()
                : null;

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            {
                approvalStatus: decision,
                isVerified: isApproved,
                rejectionReason: cleanReason,
                reviewedBy: req.user._id,
                reviewedAt: new Date()
            },
            { new: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ message: "Utilisateur introuvable." });
        }

        const [userWithProfile] = await attachProfiles([updatedUser]);

        res.json({
            message: isApproved
                ? "Le compte a été approuvé avec succès."
                : "La demande d'inscription a été refusée.",
            user: userWithProfile
        });
    } catch (error) {
        console.error("Error reviewing user:", error);
        res.status(500).json({ message: "Erreur lors de la validation de l'utilisateur." });
    }
});

// @route   PUT api/admin/verify-user/:id
// @desc    Valider ou bloquer un étudiant (compatibilité ascendante)
// @access  Private (Admin)
router.put('/verify-user/:id', isAdmin, async (req, res) => {
    const { isVerified, rejectionReason } = req.body; // { "isVerified": true } ou false

    try {
        if (typeof isVerified !== 'boolean') {
            return res.status(400).json({ message: "Le champ isVerified (booléen) est requis." });
        }

        const approvalStatus = isVerified ? 'approved' : 'rejected';
        const cleanReason =
            !isVerified && typeof rejectionReason === 'string' && rejectionReason.trim()
                ? rejectionReason.trim()
                : null;

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            {
                isVerified,
                approvalStatus,
                rejectionReason: cleanReason,
                reviewedBy: req.user._id,
                reviewedAt: new Date()
            },
            { new: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ message: "Utilisateur introuvable." });
        }

        const [userWithProfile] = await attachProfiles([updatedUser]);
        const statusText = isVerified ? "validé" : "bloqué/refusé";

        res.json({
            message: `Le compte de l'étudiant a été ${statusText} avec succès.`,
            user: userWithProfile
        });
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ message: "Erreur lors de la mise à jour de l'utilisateur." });
    }
});

module.exports = router;