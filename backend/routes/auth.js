const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// @route   POST api/auth/register
// @desc    Inscrire un nouvel étudiant / alumni
router.post('/register', async (req, res) => {
    const { email, password, role } = req.body;

    try {
        // 1. Vérifier si l'utilisateur existe déjà
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "Cet utilisateur existe déjà." });
        }

        // 2. Créer l'instance du nouvel utilisateur
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

        // 5. Générer un token JWT valide pour 24h (1 jour)
        const payload = { userId: user.id, role: user.role };
        const token = jwt.sign(
            payload, 
            process.env.JWT_SECRET || 'secret_temporaire', 
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: "Utilisateur créé avec succès ! 🎉",
            token,
            user: { id: user.id, email: user.email, role: user.role }
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Erreur serveur lors de l'inscription.");
    }
});

// @route   POST api/auth/login
// @desc    Connecter un étudiant / alumni & obtenir le token
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

module.exports = router;