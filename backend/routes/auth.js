const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

// @route   POST api/auth/register
// @desc    Inscrire un nouvel étudiant / alumni (En attente de validation)
router.post('/register', async (req, res) => {
    const { email, password, role } = req.body;

    try {
        // 1. Vérifier si l'utilisateur existe déjà
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "Cet utilisateur existe déjà." });
        }

        // 2. Créer l'instance du nouvel utilisateur
        // Note : Par défaut, isVerified sera à false (défini dans le modèle)
        user = new User({
            email,
            password,
            role
        });

        // 3. Hacher (crypter) le mot de passe
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // 4. Sauvegarder dans MongoDB
        await user.save();

        // 🔒 SÉCURITÉ : Pas de token généré ici. L'utilisateur doit attendre la validation admin.
        res.status(201).json({
            message: "Inscription enregistrée avec succès ! Votre compte est en attente de validation par l'administration de HITAS. 🎉",
            user: { id: user.id, email: user.email, role: user.role }
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Erreur serveur lors de l'inscription.");
    }
});

// @route   POST api/auth/login
// @desc    Connecter un étudiant / alumni & obtenir le token s'il est validé
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Vérifier si l'utilisateur existe
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Identifiants invalides." });
        }

        // 2. Vérifier si le mot de passe correspond
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Identifiants invalides." });
        }

        // 🔒 BARRIÈRE DE SÉCURITÉ : Vérifier si le compte est validé
        // On laisse l'admin passer d'office pour éviter les blocages de configuration
        if (!user.isVerified && user.role !== 'admin') {
            return res.status(403).json({ 
                message: "Votre compte est en attente de validation par l'administration de HITAS. Vous ne pouvez pas encore vous connecter." 
            });
        }

        // 3. Générer un nouveau token JWT valide pour 24h
        const payload = { userId: user.id, role: user.role };
        const token = jwt.sign(
            payload, 
            process.env.JWT_SECRET || 'secret_temporaire', 
            { expiresIn: '24h' }
        );

        res.json({
            message: "Connexion réussie ! Connexion établie. 🔑",
            token,
            user: { id: user.id, email: user.email, role: user.role }
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Erreur serveur lors de la connexion.");
    }
});

// @route   PUT /api/auth/fcm-token
// @desc    Enregistrer le token Firebase de l'utilisateur connecté
// @access  Private
router.put('/fcm-token', auth, async (req, res) => {

    try {

        console.log("=== ROUTE FCM APPELÉE ===");

        const { token } = req.body;

        console.log("Token reçu :", token);

        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({
                message: "Utilisateur introuvable."
            });
        }

        console.log("Utilisateur trouvé :", user.email);

        if (!user.fcmTokens) {
            user.fcmTokens = [];
        }

        if (!user.fcmTokens.includes(token)) {
            user.fcmTokens.push(token);
            console.log("Tableau avant sauvegarde :", user.fcmTokens);

            await user.save();

            console.log("✅ Utilisateur sauvegardé");
        }

        res.json({
            success: true
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Erreur serveur"
        });

    }

});

module.exports = router;