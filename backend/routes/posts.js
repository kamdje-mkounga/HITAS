const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); 
const Post = require('../models/Post');
const Profile = require('../models/Profile');
const multer = require('multer');
const { getVideoDurationInSeconds } = require('get-video-duration');
const path = require('path');
const fs = require('fs');

// Configuration du stockage de Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads/';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// Validation stricte et élargie des extensions acceptées
const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 Mo max pour les vidéos
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|webp|mp4|mov|m4v|webm|quicktime|mp3|wav|m4a|ogg|mpeg/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Format non supporté ! Choisissez une image (jpg, png, webp), une vidéo (mp4, mov) ou un audio.'));
    }
  }
});

// @route   POST api/posts
// @desc    Créer une publication (Texte + Média optionnel)
// @access  Private
router.post('/', auth, (req, res) => {
  upload.single('media')(req, res, async (err) => {
    if (err) {
      console.error("Erreur de téléversement Multer :", err.message);
      return res.status(400).json({ message: err.message });
    }

    try {
      const profile = await Profile.findOne({ user: req.user.userId });
      
      if (!profile) {
        return res.status(400).json({ message: "Tu dois créer un profil avant de pouvoir publier." });
      }

      let mediaUrl = '';
      let mediaType = null;

      // Un seul bloc req.file propre et unifié
      if (req.file) {
        mediaUrl = `/uploads/${req.file.filename}`;
        const mime = req.file.mimetype.toLowerCase();
        const ext = path.extname(req.file.originalname).toLowerCase(); // 🛠️ Correction ici : req.file au lieu de file
        
        // Détection du type de média
        if (mime.startsWith('video') || ['.mp4', '.mov', '.qt', '.webm', '.m4v'].includes(ext)) {
          mediaType = 'video';
          
          // VÉRIFICATION DE LA DURÉE DE LA VIDÉO (Max 3 minutes / 180s)
          const pathToFile = path.join(__dirname, '../', mediaUrl);
          try {
            const duration = await getVideoDurationInSeconds(pathToFile);
            if (duration > 180) {
              fs.unlinkSync(pathToFile); // Supprime le fichier trop long
              return res.status(400).json({ message: "La vidéo dépasse la limite maximale de 3 minutes." });
            }
          } catch (durationErr) {
            console.error("Impossible de lire la durée de la vidéo :", durationErr);
          }

        } else if (mime.startsWith('audio') || ['.mp3', '.wav', '.m4a', '.ogg', '.mpeg'].includes(ext)) {
          mediaType = 'audio';
        } else if (mime.startsWith('image') || ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
          mediaType = 'image';
        }
      }

      const newPost = new Post({
        text: req.body.text,
        category: req.body.category,
        firstName: profile.firstName,
        lastName: profile.lastName,
        avatar: profile.avatar || '',
        user: req.user.userId,
        mediaUrl: mediaUrl,   
        mediaType: mediaType  
      });

      const post = await newPost.save();
      res.json(post);
    } catch (dbErr) {
      console.error("Erreur lors de la création en BDD :", dbErr.message);
      res.status(500).send('Erreur serveur lors de la création de la publication.');
    }
  });
});

// @route   GET api/posts
// @desc    Récupérer toutes les publications
// @access  Public
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erreur serveur lors de la récupération des publications.');
  }
});

// @route   DELETE api/posts/:id
// @desc    Supprimer une publication
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Publication non trouvée.' });
    }

    if (post.user.toString() !== req.user.userId) {
      return res.status(401).json({ message: 'Utilisateur non autorisé à supprimer ce post.' });
    }

    // [Optionnel] Si un média physique existe sur le serveur, on le supprime aussi
    if (post.mediaUrl) {
      const pathToMedia = path.join(__dirname, '../', post.mediaUrl);
      if (fs.existsSync(pathToMedia)) {
        fs.unlinkSync(pathToMedia);
      }
    }

    await post.deleteOne();
    res.json({ message: 'Publication supprimée avec succès.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erreur serveur lors de la suppression.');
  }
});

// @route   PUT api/posts/:id
// @desc    Modifier une publication
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    let post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Publication non trouvée.' });
    }

    if (post.user.toString() !== req.user.userId) {
      return res.status(401).json({ message: 'Utilisateur non autorisé.' });
    }

    if (req.body.text !== undefined) post.text = req.body.text;
    if (req.body.category) post.category = req.body.category;

    await post.save();
    res.json(post);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erreur serveur lors de la modification.');
  }
});

// @route   POST api/posts/comment/:id
// @desc    Ajouter un commentaire sur un post
// @access  Private
router.post('/comment/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Publication non trouvée' });
    }

    const profile = await Profile.findOne({ user: req.user.userId });

    const newComment = {
      user: req.user.userId,
      text: req.body.text,
      firstName: profile ? profile.firstName : 'Étudiant',
      lastName: profile ? profile.lastName : 'Anonyme',
      avatar: profile ? profile.avatar : ''
    };

    post.comments.unshift(newComment);
    await post.save();

    res.json(post.comments);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Publication non trouvée' });
    }
    res.status(500).send('Erreur Serveur');
  }
});

// @route   PUT api/posts/like/:id
// @desc    Liker ou unliker une publication
// @access  Private
router.put('/like/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Publication non trouvée.' });
    }

    const alreadyLiked = post.likes.some(like => like.user.toString() === req.user.userId);

    if (alreadyLiked) {
      post.likes = post.likes.filter(like => like.user.toString() !== req.user.userId);
    } else {
      post.likes.unshift({ user: req.user.userId });
    }

    await post.save();
    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erreur serveur lors de la gestion du like.');
  }
});

module.exports = router;