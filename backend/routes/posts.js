const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); 
const Post = require('../models/Post');
const Profile = require('../models/Profile');
const multer = require('multer');
const { getVideoDurationInSeconds } = require('get-video-duration');
const { Readable } = require('stream'); // Requis pour lire la vidéo depuis la mémoire
const { uploadFile, deleteFile } = require("../utils/supabaseStorage");

// Configuration du stockage de Multer en mémoire
const storage = multer.memoryStorage();

// Validation des extensions acceptées
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50Mo max
  },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|webp|mp4|mov|m4v|webm|quicktime|mp3|wav|m4a|ogg|mpeg/;
    const ext = file.originalname.split('.').pop().toLowerCase();
    const isExtValid = filetypes.test(ext);
    const isMimeValid = filetypes.test(file.mimetype);

    if (isMimeValid && isExtValid) {
      return cb(null, true);
    }
    cb(new Error("Format non supporté !"));
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
      let mediaPath = null;

      if (req.file) {
        const mime = req.file.mimetype.toLowerCase();
        const ext = file.originalname.split('.').pop().toLowerCase();
        
        // Détermination du type de média
        if (mime.startsWith('video') || ['mp4', 'mov', 'qt', 'webm', 'm4v'].includes(ext)) {
          mediaType = 'video';
          
          // Vérification de la durée du fichier vidéo en mémoire buffer
          try {
            const stream = Readable.from(req.file.buffer);
            const duration = await getVideoDurationInSeconds(stream);
            if (duration > 180) {
              return res.status(400).json({ message: "La vidéo dépasse la limite maximale de 3 minutes." });
            }
          } catch (durationErr) {
            console.error("Impossible de lire la durée de la vidéo :", durationErr);
          }
        } else if (mime.startsWith('audio') || ['mp3', 'wav', 'm4a', 'ogg', 'mpeg'].includes(ext)) {
          mediaType = 'audio';
        } else if (mime.startsWith('image') || ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
          mediaType = 'image';
        }

        // Upload sur Supabase après validation
        const uploaded = await uploadFile(req.file, "posts");
        mediaUrl = uploaded.url;
        mediaPath = uploaded.path;
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
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Publication non trouvée.' });
    }

    if (post.user.toString() !== req.user.userId) {
      return res.status(401).json({ message: 'Utilisateur non autorisé à supprimer ce post.' });
    }

    // Supprime le média de Supabase s'il existe
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
// @desc    Modifier une publication
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

      if (req.body.text !== undefined) post.text = req.body.text;
      if (req.body.category) post.category = req.body.category;

      let fileToDelete = null;

      // Un nouveau fichier remplace l'ancien
      if (req.file) {
        if (post.mediaPath) {
          fileToDelete = post.mediaPath;
        }

        const mime = req.file.mimetype.toLowerCase();
        const ext = file.originalname.split('.').pop().toLowerCase();
        
        if (mime.startsWith('video') || ['mp4', 'mov', 'qt', 'webm', 'm4v'].includes(ext)) {
          post.mediaType = 'video';
          try {
            const stream = Readable.from(req.file.buffer);
            const duration = await getVideoDurationInSeconds(stream);
            if (duration > 180) {
              return res.status(400).json({ message: "La vidéo dépasse la limite maximale de 3 minutes." });
            }
          } catch (durationErr) {
            console.error("Impossible de lire la durée de la vidéo :", durationErr);
          }
        } else if (mime.startsWith('audio') || ['mp3', 'wav', 'm4a', 'ogg', 'mpeg'].includes(ext)) {
          post.mediaType = 'audio';
        } else if (mime.startsWith('image') || ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
          post.mediaType = 'image';
        }

        const uploaded = await uploadFile(req.file, "posts");
        post.mediaUrl = uploaded.url;
        post.mediaPath = uploaded.path;

      // L'utilisateur a cliqué sur "Retirer" le média existant
      } else if (req.body.existingMediaUrl === '') {
        if (post.mediaPath) {
          fileToDelete = post.mediaPath;
        }
        post.mediaUrl = '';
        post.mediaType = null;
        post.mediaPath = null;
      }
      
      await post.save();

      // Suppression de l'ancien fichier sur Supabase
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
    res.status(500).send('Erreur Serveur');
  }
});

// @route   PUT api/posts/like/:id
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