const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const Profile = require('../models/Profile'); 

// Force le chemin absolu pour pointer dans "backend/uploads"
const uploadDir = path.join(__dirname, '../uploads');

// Vérification et création du dossier si inexistant
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuration Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    cb(null, 'avatar-' + uniqueSuffix);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Seules les images sont autorisées !'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 1024 * 1024 * 5 } // 5Mo max
});

// @route    GET api/profile
// @desc     ⚡ NOUVEAU : Récupérer tous les profils pour l'Annuaire de la Diaspora
// @access   Public
router.get('/', async (req, res) => {
  try {
    // Récupère tous les profils et y lie l'email et le rôle depuis la collection User
    const profiles = await Profile.find().populate('user', ['email', 'role']);
    res.json(profiles);
  } catch (err) {
    console.error("Erreur lors de la récupération des membres :", err.message);
    res.status(500).send('Erreur Serveur');
  }
});

// @route    GET api/profile/me
// @desc     Obtenir le profil de l'utilisateur connecté
// @access   Private
router.get('/me', auth, async (req, res) => {
  try {
    // 🛠️ Correction : Remplacement de .id par .userId
    const profile = await Profile.findOne({ user: req.user.userId });
    if (!profile) {
      return res.status(400).json({ message: "Aucun profil trouvé pour cet utilisateur." });
    }
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erreur Serveur');
  }
});

// @route    POST api/profile
// @desc     Créer ou modifier un profil
// @access   Private
router.post('/', auth, upload.single('avatar'), async (req, res) => {
  const { firstName, lastName, promotion, specialty, currentLocation, bio, skills } = req.body;

  // 🛠️ Correction : Remplacement de .id par .userId
  const profileFields = {
    user: req.user.userId,
    firstName,
    lastName,
    promotion,
    specialty,
    currentLocation,
    bio,
    skills: skills ? skills.split(',').map(skill => skill.trim()) : []
  };

  try {
    // Recherche si un profil existe déjà pour cet utilisateur
    let profile = await Profile.findOne({ user: req.user.userId });

    if (profile) {
      // 🔄 S'il existe et qu'une nouvelle image est envoyée, on vire l'ancien avatar du disque
      if (req.file && profile.avatar) {
        const oldAvatarPath = path.join(__dirname, '../', profile.avatar);
        if (fs.existsSync(oldAvatarPath)) {
          fs.unlinkSync(oldAvatarPath);
        }
      }
    }

    // Si un nouveau fichier est téléversé, on l'ajoute aux champs
    if (req.file) {
      profileFields.avatar = `/uploads/${req.file.filename}`;
    }

    // Mise à jour ou création dynamique
    profile = await Profile.findOneAndUpdate(
      { user: req.user.userId },
      { $set: profileFields },
      { new: true, upsert: true }
    );
    
    res.json(profile);
  } catch (err) {
    console.error("Erreur d'enregistrement Mongoose :", err.message);
    res.status(500).send('Erreur Serveur');
  }
});

module.exports = router;