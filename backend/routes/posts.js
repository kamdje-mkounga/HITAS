const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); 
const Post = require('../models/Post');
const Profile = require('../models/Profile');
const multer = require('multer');
const { getVideoDurationInSeconds } = require('get-video-duration');
const path = require('path');
const fs = require('fs');
const {
  uploadFile,
  deleteFile
} = require("../utils/supabaseStorage");

// Configuration du stockage de Multer
const storage = multer.memoryStorage();

// Validation stricte et élargie des extensions acceptées
const upload = multer({
  storage,
  limits: {
      fileSize: 50 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {

      const filetypes =
          /jpeg|jpg|png|gif|webp|mp4|mov|m4v|webm|quicktime|mp3|wav|m4a|ogg|mpeg/;

      const extname =
          filetypes.test(path.extname(file.originalname).toLowerCase());

      const mimetype =
          filetypes.test(file.mimetype);

      if (mimetype && extname) {
          return cb(null, true);
      }

      cb(new Error(
          "Format non supporté !"
      ));
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

      if (req.file) {
        const uploaded = await uploadFile(req.file, "posts");

mediaUrl = uploaded.url;
const mediaPath = uploaded.path;
        const mime = req.file.mimetype.toLowerCase();
        const ext = path.extname(req.file.originalname).toLowerCase();
        
        if (mime.startsWith('video') || ['.mp4', '.mov', '.qt', '.webm', '.m4v'].includes(ext)) {
          mediaType = 'video';
         
          try {
            const duration = await getVideoDurationInSeconds(pathToFile);
            if (duration > 180) {
              await deleteFile(mediaPath);
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
        mediaType: mediaType,
        mediaPath: mediaPath  
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
    const posts = await Post.find().sort({ date: -1 }).lean();
    
    const updatedPosts = await Promise.all(posts.map(async (post) => {
      if (post.user) {
        const userProfile = await Profile.findOne({ user: post.user }).select('avatar');
        if (userProfile && userProfile.avatar) {
          post.avatar = userProfile.avatar;
        }
      }

      if (post.comments && post.comments.length > 0) {
        post.comments = await Promise.all(post.comments.map(async (comment) => {
          if (comment.user) {
            const commentProfile = await Profile.findOne({ user: comment.user }).select('avatar');
            if (commentProfile && commentProfile.avatar) {
              comment.avatar = commentProfile.avatar;
            }
          }
          return comment;
        }));
      }

      return post;
    }));

    res.json(updatedPosts);
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

    if (post.mediaPath) {
      await deleteFile(post.mediaPath);
  }

    await post.deleteOne();
    res.json({ message: 'Publication supprimée avec succès.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erreur serveur lors de la suppression.');
  }
});

// @route   PUT api/posts/:id
// @desc    Modifier une publication (Gestion complète texte + médias)
// @access  Private
router.put('/:id', auth, (req, res) => {
  upload.single('media')(req, res, async (err) => {
    if (err) {
      console.error("Erreur Multer lors de la modification :", err.message);
      return res.status(400).json({ message: err.message });
    }

    try {
      let post = await Post.findById(req.params.id);

      if (!post) {
        return res.status(404).json({ message: 'Publication non trouvée.' });
      }

      if (post.user.toString() !== req.user.userId) {
        return res.status(401).json({ message: 'Utilisateur non autorisé.' });
      }

      // Mise à jour des champs basiques s'ils sont fournis
      if (req.body.text !== undefined) post.text = req.body.text;
      if (req.body.category) post.category = req.body.category;

      // Variable pour traquer si on doit supprimer un fichier physique du serveur
      let fileToDelete = null;

      // 1. Un NOUVEAU fichier a été téléversé
      if (req.file) {
        // On prépare la suppression de l'ancien fichier s'il existait
        if (post.mediaUrl) {
          fileToDelete = post.mediaPath;
        }

        const uploaded = await uploadFile(req.file, "posts");

post.mediaUrl = uploaded.url;
post.mediaPath = uploaded.path;
//
        const mime = req.file.mimetype.toLowerCase();
        const ext = path.extname(req.file.originalname).toLowerCase();
        
        // Détermination du nouveau type et sécurité vidéo
         if (mime.startsWith('video') || ['.mp4', '.mov', '.qt', '.webm', '.m4v'].includes(ext)) {
          post.mediaType = 'video';
          const tempFile = req.file;
          try {
            const duration = await getVideoDurationInSeconds(pathToFile);
            if (duration > 180) {
              await deleteFile(post.mediaPath);
              return res.status(400).json({ message: "La vidéo dépasse la limite maximale de 3 minutes." });
            }
          } catch (durationErr) {
            console.error("Impossible de lire la durée de la vidéo :", durationErr);
          }
        } else if (mime.startsWith('audio') || ['.mp3', '.wav', '.m4a', '.ogg', '.mpeg'].includes(ext)) {
          post.mediaType = 'audio';
        } else if (mime.startsWith('image') || ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
          post.mediaType = 'image';
        }

      // 2. Pas de nouveau fichier, mais l'utilisateur a cliqué sur "Retirer" le média existant
      } else if (req.body.existingMediaUrl === '') {
        if (post.mediaUrl) {
          fileToDelete = path.join(__dirname, '../', post.mediaUrl);
        }
        post.mediaUrl = '';
        post.mediaType = null;
      }
      

      // Sauvegarde des modifications en base de données
      await post.save();

      // Nettoyage physique du stockage si nécessaire (seulement APRÈS une sauvegarde réussie)
      if (fileToDelete) {
        await deleteFile(fileToDelete);
    }

      res.json(post);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Erreur serveur lors de la modification.');
    }
  });
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