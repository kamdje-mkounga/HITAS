const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); 
const Post = require('../models/Post');
const User = require('../models/User');
const Profile = require('../models/Profile');
const admin = require('../config/firebaseAdmin');
const multer = require('multer');
const { getVideoDurationInSeconds } = require('get-video-duration');
const { Readable } = require('stream'); 
const { uploadFile, deleteFile } = require("../utils/supabaseStorage");

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
      
      // 🔔 Notification Firebase avec calcul de Badge dynamique pour l'icône de l'application
      // 🔔 Notification Firebase avec correction du Badge pour iOS PWA fermée
try {
  // Tous les utilisateurs sauf celui qui vient de publier
  const users = await User.find({
      _id: { $ne: req.user.userId },
      fcmTokens: { $exists: true, $not: { $size: 0 } }
  });

  const messages = [];

  for (const user of users) {
    const lastViewedBlog = user.lastViewedBlog || new Date(0);
    
    // Compte le nombre d'articles non lus
    const unreadCount = await Post.countDocuments({
      user: { $ne: user._id },
      date: { $gt: lastViewedBlog }
    });

    user.fcmTokens.forEach(token => {
      messages.push({
        token,
        notification: {
          title: "📢 Nouvelle publication",
          body: `${profile.firstName} ${profile.lastName} vient de publier un nouveau post.`
        },
        // 🍏 Utile si c'est encapsulé dans une app native (Cordova/Capacitor/React Native)
        apns: {
          payload: {
            aps: {
              badge: unreadCount,
              sound: "default"
            }
          }
        },
        // 🌐 ESSENTIEL POUR IOS PWA (Safari / Icône sur l'écran d'accueil)
        // C'est ce bloc qu'iOS intercepte nativement au niveau du système, même si l'application est fermée !
        webpush: {
          notification: {
            title: "📢 Nouvelle publication",
            body: `${profile.firstName} ${profile.lastName} vient de publier un nouveau post.`,
            icon: "https://hitas.onrender.com/hitas_logo.svg",
            badge: "https://hitas.onrender.com/hitas_logo.svg", // L'icône de statut
            requireInteraction: true
          },
          headers: {
            // Indique à Apple le nombre exact à poser sur l'icône
            "X-Badge": String(unreadCount)
          },
          fcmOptions: {
            link: "https://ronaldokamdje-9589s-projects.vercel.app/blog"
          }
        }
      });
    });
  }

  if (messages.length > 0) {
      const response = await admin.messaging().sendEach(messages);
      console.log(`✅ ${response.successCount}/${messages.length} notifications poussées.`);
  }

} catch (err) {
  console.error("🔥 Firebase Error lors de la configuration du badge WebPush:", err);
}
      
      // Convertir en objet simple pour pouvoir manipuler l'avatar proprement au besoin
      const postWithLean = post.toObject();

      // 🌐 TEMPS RÉEL : On diffuse à tout le monde ! 
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

    // 🔔 MISE À JOUR DU BADGE FIREBASE (Après suppression)
    try {
      // On cherche tous les autres utilisateurs qui ont des tokens push configurés
      const usersToUpdate = await User.find({
        _id: { $ne: req.user.userId },
        fcmTokens: { $exists: true, $not: { $size: 0 } }
      });

      const badgeMessages = [];

      for (const user of usersToUpdate) {
        const lastViewedBlog = user.lastViewedBlog || new Date(0);
        
        // Recalcul du nouveau total d'articles non lus (sans celui qui vient d'être supprimé)
        const newUnreadCount = await Post.countDocuments({
          user: { $ne: user._id },
          date: { $gt: lastViewedBlog }
        });

        user.fcmTokens.forEach(token => {
          badgeMessages.push({
            token,
            // 💡 On passe aussi la donnée brute pour que le code de l'application puisse la lire facilement
            data: {
              action: "DELETE_POST",
              unreadCount: String(newUnreadCount) 
            },
            apns: {
              payload: {
                aps: {
                  badge: newUnreadCount,
                  "content-available": 1
                }
              }
            }
          });
        });
      }

      if (badgeMessages.length > 0) {
        await admin.messaging().sendEach(badgeMessages);
        console.log(`📉 Pastilles d'icônes mises à jour pour ${badgeMessages.length} appareils suite à la suppression.`);
      }

    } catch (firebaseErr) {
      console.error("🔥 Erreur Firebase lors de la baisse du badge :", firebaseErr);
    }

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
      const senderSocketId = req.body.socketId; 
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
          const commentProfile = await Profile.findOne({ user: userProfile.user }).select('avatar');
          if (commentProfile && commentProfile.avatar) comment.avatar = commentProfile.avatar;
        }
        return comment;
      }));
    }

    // 🌐 TEMPS RÉEL : Diffuser le post mis à jour avec le nouveau commentaire
    const io = req.app.get('io');
    if (io) {
      const senderSocketId = req.body.socketId; 
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