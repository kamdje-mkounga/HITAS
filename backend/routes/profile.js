const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const auth = require('../middleware/auth');
const Profile = require('../models/Profile'); 
const User = require('../models/User'); 
const Post = require('../models/Post'); 
const { uploadFile, deleteFile } = require('../utils/supabaseStorage');

// Local upload dir setup
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer memory storage configuration
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (file.mimetype.startsWith('image/') || ext === '.heic' || ext === '.heif') {
    cb(null, true);
  } else {
    cb(new Error('Seules les images sont autorisées !'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 1024 * 1024 * 5 } // 5MB max
});

// @route    GET api/profile
// @desc     Récupérer tous les profils pour l'Annuaire de la Diaspora
// @access   Public
router.get('/', async (req, res) => {
  try {
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
    country,
    city,
    currentLocation,
    jobTitle,
    currentCompany,
    status,
    degreeLevel,
    bio,
    skills
  } = req.body;

  const profileFields = {
    user: req.user.userId,
    firstName,
    lastName,
    promotion,
    specialty,
    country,
    city,
    currentLocation,
    jobTitle,
    currentCompany,
    status,
    degreeLevel,
    bio,
    skills: Array.isArray(skills)
      ? skills
      : typeof skills === 'string' && skills.trim() !== ''
        ? skills.split(',').map(skill => skill.trim())
        : []
  };

  try {
    let profile = await Profile.findOne({ user: req.user.userId });

    // Handle Avatar Upload to Supabase Storage with Sharp
    if (req.file) {
      if (profile && profile.avatarPath) {
        try {
          await deleteFile(profile.avatarPath);
        } catch (delErr) {
          console.error("Error deleting old avatar:", delErr.message);
        }
      }

      try {
        // Tentative de conversion avec Sharp
        const convertedBuffer = await sharp(req.file.buffer)
          .rotate() 
          .jpeg({ quality: 85 }) 
          .toBuffer();

        req.file.buffer = convertedBuffer;
        req.file.mimetype = 'image/jpeg';
        const baseName = path.parse(req.file.originalname).name;
        req.file.originalname = `${baseName}.jpg`;
      } catch (sharpErr) {
        console.error("Erreur de conversion Sharp (format HEIC non supporté par le serveur) :", sharpErr);
        return res.status(400).json({
          message: "Format d'image non pris en charge par le serveur. Veuillez convertir votre photo en JPEG ou PNG."
        });
      }

      const uploaded = await uploadFile(req.file, "avatars");
      console.log("File received & converted:", req.file?.originalname);
      console.log("Supabase upload result:", uploaded);

      profileFields.avatar = uploaded.url;
      profileFields.avatarPath = uploaded.path;
    }

    profile = await Profile.findOneAndUpdate(
      { user: req.user.userId },
      { $set: profileFields },
      { new: true, upsert: true }
    );

    res.json(profile);

  } catch (err) {
    console.error("PROFILE UPLOAD ERROR:", err);
    res.status(500).json({
      message: "Unable to save profile.",
      error: err.message
    });
  }
});

// @route    DELETE api/profile
// @desc     Supprimer le compte, le profil et les publications de l'utilisateur
// @access   Private
router.delete('/', auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    // 1. Supprimer toutes les publications de l'utilisateur
    await Post.deleteMany({ user: userId });

    // 2. Nettoyer les fichiers Supabase si un avatar existe
    const profile = await Profile.findOne({ user: userId });
    
    if (profile) {
      try {
        const pathToDelete = profile.avatarPath || profile.avatar;
        if (pathToDelete) {
          if (pathToDelete.includes('/media/')) {
            const relativePath = pathToDelete.split('/media/')[1];
            await deleteFile(relativePath);
          } else if (!pathToDelete.startsWith('http')) {
            await deleteFile(pathToDelete);
          }
        }
      } catch (storageErr) {
        console.error("Échec du nettoyage de l'avatar sur Supabase :", storageErr.message);
      }
    }

    // 3. Supprimer le profil et le compte de la DB
    await Profile.findOneAndDelete({ user: userId });
    await User.findByIdAndDelete(userId);

    res.json({ message: 'Compte et données supprimés avec succès.' });
  } catch (err) {
    console.error("Erreur lors de la suppression du compte :", err.message);
    res.status(500).send('Erreur serveur lors de la suppression du compte.');
  }
});

// @route    GET api/profile/:id
// @desc     Obtenir le profil public d'un étudiant par son ID
// @access   Public
router.get('/:id', async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.params.id }).populate('user', ['email']);
    
    if (!profile) {
      return res.status(404).json({ message: "Le profil de cet étudiant n'existe pas." });
    }
    
    res.json(profile);
  } catch (err) {
    console.error("Erreur récupération profil public :", err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: "Format d'identifiant invalide." });
    }
    res.status(500).send('Erreur Serveur');
  }
});

module.exports = router;