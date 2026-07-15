const express = require('express');
const User = require('../models/User');
const admin = require('../config/firebaseAdmin');
const router = express.Router();
const auth = require('../middleware/auth'); 
const Post = require('../models/Post');
const Profile = require('../models/Profile');
const multer = require('multer');
const { getVideoDurationInSeconds } = require('get-video-duration');
const { Readable } = require('stream'); 
const { uploadFile, deleteFile } = require("../utils/supabaseStorage");
const User = require('../models/User');
const admin = require('../config/firebaseAdmin');

// Configuration du stockage de Multer en mémoire
const storage = multer.memoryStorage();

// Validation des extensions acceptées (Images, Vidéos, Audio, PDF, Word)
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50Mo max
  },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|webp|mp4|mov|m4v|webm|quicktime|mp3|wav|m4a|ogg|mpeg|pdf|msword|vnd.openxmlformats-officedocument.wordprocessingml.document/;
    const ext = file.originalname.split('.').pop().toLowerCase();
    const isExtValid = filetypes.test(ext);
    const isMimeValid = filetypes.test(file.mimetype);

    if (isMimeValid || isExtValid) {
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
        const ext = req.file.originalname.split('.').pop().toLowerCase();
        
        // Détermination et validation complète du type de média
        if (mime.startsWith('video') || ['mp4', 'mov', 'qt', 'webm', 'm4v'].includes(ext)) {
          mediaType = 'video';
          
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
        } else if (mime === 'application/pdf' || ext === 'pdf') {
          mediaType = 'pdf';
        } else if (['msword', 'vnd.openxmlformats-officedocument.wordprocessingml.document'].some(v => mime.includes(v)) || ['doc', 'docx'].includes(ext)) {
          mediaType = 'document';
        } else {
          mediaType = 'file';
        }

        // Upload sur Supabase après validation du type
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
      //
      // 🔔 Notification Firebase
try {

  // Récupère tous les utilisateurs ayant au moins un token FCM
  const users = await User.find({
      fcmTokens: { $exists: true, $ne: [] }
  });

  // Fusionne tous les tokens dans un seul tableau
  const tokens = users.flatMap(user => user.fcmTokens);

  if (tokens.length > 0) {

      const message = {
          tokens,

          notification: {
              title: "📢 Nouvelle publication",
              body: `${profile.firstName} ${profile.lastName} vient de publier un nouveau post.`
          },

          webpush: {
              notification: {
                  icon: "https://hitas.onrender.com/hitas_logo.svg",
                  badge: "https://hitas.onrender.com/hitas_logo.svg"
              },

              fcmOptions: {
                  link: "https://ronaldokamdje-9589s-projects.vercel.app/blog"
              }
          }
      };

      const response = await admin.messaging().sendEachForMulticast(message);

      console.log(
          `Notifications envoyées : ${response.successCount}/${tokens.length}`
      );

  }

} catch (err) {

  console.error("Erreur Firebase :", err);

}
      
      // Convertir en objet simple pour pouvoir manipuler l'avatar proprement au besoin
      const postWithLean = post.toObject();

      // 🌐 TEMPS RÉEL OPTIMISÉ POUR EXCLURE L'AUTEUR DE LA NOTIFICATION
      // 🌐 TEMPS RÉEL : On diffuse à tout le monde ! 
      // Le filtrage (pour ne pas s'auto-notifier) est désormais géré à 100% par le Frontend.
      const io = req.app.get('io');
      if (io) {
        io.emit('posts_created', postWithLean);
        io.emit('article_published', postWithLean);
      }

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

    if (post.mediaPath) {
      await deleteFile(post.mediaPath);
    }

    const postId = post._id;
    await post.deleteOne();

    // 🌐 TEMPS RÉEL : Notifier tout le monde de supprimer ce post de leur écran
    const io = req.app.get('io');
    if (io) io.emit('posts_deleted', postId);

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

      if (req.file) {
        if (post.mediaPath) {
          fileToDelete = post.mediaPath;
        }

        const mime = req.file.mimetype.toLowerCase();
        const ext = req.file.originalname.split('.').pop().toLowerCase();
        
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
        } else if (mime === 'application/pdf' || ext === 'pdf') {
          post.mediaType = 'pdf';
        } else if (['msword', 'vnd.openxmlformats-officedocument.wordprocessingml.document'].some(v => mime.includes(v)) || ['doc', 'docx'].includes(ext)) {
          post.mediaType = 'document';
        } else {
          post.mediaType = 'file';
        }

        const uploaded = await uploadFile(req.file, "posts");
        post.mediaUrl = uploaded.url;
        post.mediaPath = uploaded.path;

      } else if (req.body.existingMediaUrl === '') {
        if (post.mediaPath) {
          fileToDelete = post.mediaPath;
        }
        post.mediaUrl = '';
        post.mediaType = null;
        post.mediaPath = null;
      }
      
      await post.save();

      if (fileToDelete) {
        await deleteFile(fileToDelete);
      }

      const postObj = post.toObject();
      if (postObj.user) {
        const userProfile = await Profile.findOne({ user: postObj.user }).select('avatar');
        if (userProfile && userProfile.avatar) postObj.avatar = userProfile.avatar;
      }

      // 🌐 TEMPS RÉEL : Notifier de la modification du contenu du post
      const io = req.app.get('io');
      if (io) {
        const senderSocketId = req.body.socketId;
        if (senderSocketId) {
            io.except(senderSocketId).emit('posts_updated', postObj);
        } else {
            io.emit('posts_updated', postObj);
        }
      }

      res.json(post);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Erreur serveur lors de la modification.');
    }
  });
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

    const updatedPost = await Post.findById(req.params.id).lean();
    if (updatedPost.user) {
      const userProfile = await Profile.findOne({ user: updatedPost.user }).select('avatar');
      if (userProfile && userProfile.avatar) updatedPost.avatar = userProfile.avatar;
    }
    
    if (updatedPost.comments && updatedPost.comments.length > 0) {
      updatedPost.comments = await Promise.all(updatedPost.comments.map(async (comment) => {
        if (comment.user) {
          const commentProfile = await Profile.findOne({ user: comment.user }).select('avatar');
          if (commentProfile && commentProfile.avatar) comment.avatar = commentProfile.avatar;
        }
        return comment;
      }));
    }

    // 🌐 TEMPS RÉEL : Diffuser la mise à jour des interactions (Likes)
    const io = req.app.get('io');
    if (io) {
      const senderSocketId = req.body.socketId; // ⚠️ Frontend : axios.put(..., { socketId: socket.id })
      if (senderSocketId) {
        io.except(senderSocketId).emit('posts_updated_interactions', updatedPost);
      } else {
        io.emit('posts_updated_interactions', updatedPost);
      }
    }

    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erreur serveur lors de la gestion du like.');
  }
});

// @route    POST api/posts/comment/:id
// @desc     Ajouter un commentaire à une publication
// @access   Private
router.post('/comment/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const profile = await Profile.findOne({ user: req.user.userId });

    if (!post) {
      return res.status(404).json({ message: 'Publication non trouvée.' });
    }

    if (!profile) {
      return res.status(400).json({ message: 'Tu dois créer un profil avant de pouvoir commenter.' });
    }

    const newComment = {
      user: req.user.userId,
      text: req.body.text,
      firstName: profile.firstName,
      lastName: profile.lastName,
      avatar: profile.avatar || ''
    };

    post.comments.unshift(newComment);

    await post.save();
    
    const updatedPost = await Post.findById(req.params.id).lean();
    if (updatedPost.user) {
      const userProfile = await Profile.findOne({ user: updatedPost.user }).select('avatar');
      if (userProfile && userProfile.avatar) updatedPost.avatar = userProfile.avatar;
    }

    if (updatedPost.comments && updatedPost.comments.length > 0) {
      updatedPost.comments = await Promise.all(updatedPost.comments.map(async (comment) => {
        if (comment.user) {
          const commentProfile = await Profile.findOne({ user: comment.user }).select('avatar');
          if (commentProfile && commentProfile.avatar) comment.avatar = commentProfile.avatar;
        }
        return comment;
      }));
    }

    // 🌐 TEMPS RÉEL : Diffuser le post mis à jour avec le nouveau commentaire
    const io = req.app.get('io');
    if (io) {
      const senderSocketId = req.body.socketId; // ⚠️ Frontend : axios.post(..., { text: "...", socketId: socket.id })
      if (senderSocketId) {
        io.except(senderSocketId).emit('posts_updated_interactions', updatedPost);
      } else {
        io.emit('posts_updated_interactions', updatedPost);
      }
    }

    res.json(updatedPost.comments);
  } catch (err) {
    console.error("Erreur lors de l'ajout du commentaire :", err.message);
    res.status(500).send("Erreur serveur lors de l'ajout du commentaire.");
  }
});

module.exports = router;