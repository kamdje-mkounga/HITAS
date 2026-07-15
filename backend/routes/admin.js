const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// 🔒 MIDDLEWARE DE SÉCURITÉ : Vérifie si l'utilisateur est connecté et ADMIN
const isAdmin = async (req, res, next) => {
    try {
        // Récupérer le token dans l'en-tête Authorization (Bearer <token>)
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: "Accès refusé. Aucun token fourni." });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_temporaire');
        
        // Chercher l'utilisateur pour valider son rôle
        const user = await User.findById(decoded.userId);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ message: "Accès refusé. Privilèges administrateur requis." });
        }

        req.user = user; // On passe l'admin au reste de la requête
        next();
    } catch (error) {
        return res.status(401).json({ message: "Token invalide ou expiré." });
    }
};

// @route   GET api/admin/users
// @desc    Obtenir la liste de tous les utilisateurs (pour voir qui est vérifié ou non)
router.get('/users', isAdmin, async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des utilisateurs." });
    }
});

// @route   PUT api/admin/verify-user/:id
// @desc    Valider ou bloquer un étudiant
router.put('/verify-user/:id', isAdmin, async (req, res) => {
    const { isVerified } = req.body; // Envoyer { "isVerified": true } ou false

    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { isVerified },
            { new: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ message: "Utilisateur introuvable." });
        }

        const statusText = isVerified ? "validé" : "bloqué/suspendu";
        res.json({ 
            message: `Le compte de l'étudiant a été ${statusText} avec succès. ✨`, 
            user: updatedUser 
        });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la mise à jour de l'utilisateur." });
    }
});

module.exports = router;