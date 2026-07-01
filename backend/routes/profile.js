const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const Profile = require('../models/Profile'); 
const supabase = require('../config/supabase');
// Force le chemin absolu pour pointer dans "backend/uploads"
const uploadDir = path.join(__dirname, '../uploads');
const { uploadFile, deleteFile } = require('../utils/supabaseStorage');

// Vérification et création du dossier si inexistant
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
//
const storage = multer.memoryStorage();

// Configuration Multer
{/*
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    cb(null, 'avatar-' + uniqueSuffix);
  }
});
*/}

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
  const {
    firstName,
    lastName,
    promotion,
    specialty,
    currentLocation,
    bio,
    skills
  } = req.body;

  const profileFields = {
    user: req.user.userId,
    firstName,
    lastName,
    promotion,
    specialty,
    currentLocation,
    bio,
    skills: skills
      ? skills.split(',').map(skill => skill.trim())
      : []
  };

  try {

    let profile = await Profile.findOne({
      user: req.user.userId
    });

    // Upload new avatar to Supabase
    if (req.file) {

      // Delete previous avatar if one exists
      if (profile && profile.avatarPath) {
        await deleteFile(profile.avatarPath);
      }

      const uploaded = await uploadFile(req.file, "avatars");
      console.log("File received:", req.file?.originalname);
      console.log("Supabase upload result:", uploaded);

      profileFields.avatar = uploaded.url;
      profileFields.avatarPath = uploaded.path;
    }

    profile = await Profile.findOneAndUpdate(
      { user: req.user.userId },
      { $set: profileFields },
      {
        new: true,
        upsert: true
      }
    );

    res.json(profile);

  } catch (err) {

    console.error("PROFILE UPLOAD ERROR");
    console.error(err);

    res.status(500).json({
      message: "Unable to save profile.",
      error: err.message
    });

  }
});

module.exports = router;