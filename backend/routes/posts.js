const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const Post = require('../models/Post');
const User = require('../models/User');
const Profile = require('../models/Profile');
const admin = require('../config/firebaseAdmin');
const multer = require('multer');

const {
  uploadFile,
  deleteFile
} = require('../utils/supabaseStorage');


// ============================================================
// MULTER
// ============================================================

const storage = multer.memoryStorage();

const MAX_FILES = 10;
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB / fichier

const upload = multer({
  storage,

  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES
  },

  fileFilter: (req, file, cb) => {

    // 🚫 VIDÉOS INTERDITES
    if (file.mimetype && file.mimetype.startsWith('video/')) {
      return cb(
        new Error('Les vidéos ne sont pas autorisées sur HITAS.')
      );
    }

    const allowedExtensions = [
      'jpg',
      'jpeg',
      'png',
      'gif',
      'webp',
      'mp3',
      'wav',
      'm4a',
      'ogg',
      'mpeg',
      'pdf',
      'doc',
      'docx',
      'xls',
      'xlsx',
      'ppt',
      'pptx'
    ];

    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'audio/mpeg',
      'audio/mp3',
      'audio/wav',
      'audio/x-wav',
      'audio/ogg',
      'audio/mp4',
      'audio/x-m4a',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/octet-stream'
    ];

    const extension = file.originalname
      .split('.')
      .pop()
      .toLowerCase();

    const mime = file.mimetype.toLowerCase();

    const validExtension =
      allowedExtensions.includes(extension);

    const validMimeType =
      allowedMimeTypes.includes(mime);

    if (validExtension || validMimeType) {
      return cb(null, true);
    }

    return cb(
      new Error(
        `Format non supporté : ${extension}`
      )
    );
  }
});


// ============================================================
// HELPERS
// ============================================================

const getMediaType = (file) => {

  const mime = file.mimetype.toLowerCase();

  const ext = file.originalname
    .split('.')
    .pop()
    .toLowerCase();

  if (mime.startsWith('video/')) {
    throw new Error('Les vidéos ne sont pas autorisées.');
  }

  if (
    mime.startsWith('image/') ||
    ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)
  ) {
    return 'image';
  }

  if (
    mime.startsWith('audio/') ||
    ['mp3', 'wav', 'm4a', 'ogg', 'mpeg'].includes(ext)
  ) {
    return 'audio';
  }

  if (
    mime === 'application/pdf' ||
    ext === 'pdf'
  ) {
    return 'pdf';
  }

  if (
    mime.includes('msword') ||
    mime.includes('wordprocessingml') ||
    ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext)
  ) {
    return 'document';
  }

  return 'file';
};


// ============================================================
// GET /api/posts
// ============================================================

router.get('/', async (req, res) => {

  try {

    const posts = await Post
      .find()
      .sort({ date: -1 })
      .lean();

    const updatedPosts = await Promise.all(

      posts.map(async (post) => {

        if (post.user) {

          const userProfile = await Profile
            .findOne({ user: post.user })
            .select('avatar');

          if (userProfile?.avatar) {
            post.avatar = userProfile.avatar;
          }
        }

        if (
          post.comments &&
          post.comments.length > 0
        ) {

          post.comments = await Promise.all(

            post.comments.map(async (comment) => {

              if (comment.user) {

                const commentProfile =
                  await Profile
                    .findOne({ user: comment.user })
                    .select('avatar');

                if (commentProfile?.avatar) {
                  comment.avatar = commentProfile.avatar;
                }
              }

              return comment;
            })
          );
        }

        if (
          (!post.mediaFiles ||
            post.mediaFiles.length === 0) &&
          post.mediaUrl
        ) {

          post.mediaFiles = [
            {
              url: post.mediaUrl,
              path: post.mediaPath || '',
              type: post.mediaType || 'image',
              originalName:
                post.mediaOriginalName || ''
            }
          ];
        }

        return post;
      })
    );

    res.json(updatedPosts);

  } catch (err) {

    console.error(
      'Erreur récupération posts:',
      err.message
    );

    res
      .status(500)
      .send(
        'Erreur serveur lors de la récupération des publications.'
      );
  }
});


// ============================================================
// POST /api/posts
// ============================================================

router.post(
  '/',
  auth,
  (req, res) => {

    upload.array('media', MAX_FILES)(
      req,
      res,
      async (err) => {

        if (err) {

          console.error(
            'Erreur Multer:',
            err.message
          );

          return res.status(400).json({
            message: err.message
          });
        }

        try {

          const profile = await Profile.findOne({
            user: req.user.userId
          });

          if (!profile) {

            return res.status(400).json({
              message:
                'Tu dois créer un profil avant de pouvoir publier.'
            });
          }

          if (
            !req.body.text?.trim() &&
            (!req.files || req.files.length === 0)
          ) {

            return res.status(400).json({
              message:
                'La publication doit contenir du texte ou au moins un fichier.'
            });
          }

          const mediaFiles = [];

          if (
            req.files &&
            req.files.length > 0
          ) {

            for (const file of req.files) {

              if (
                file.mimetype &&
                file.mimetype.startsWith('video/')
              ) {

                return res.status(400).json({
                  message:
                    'Les vidéos ne sont pas autorisées sur HITAS.'
                });
              }

              const mediaType = getMediaType(file);

              const uploaded =
                await uploadFile(
                  file,
                  'posts'
                );

              mediaFiles.push({
                url: uploaded.url,
                path: uploaded.path,
                type: mediaType,
                originalName:
                  file.originalname
              });
            }
          }

          const newPost = new Post({

            text: req.body.text || '',

            category:
              req.body.category || 'General',

            firstName:
              profile.firstName,

            lastName:
              profile.lastName,

            avatar:
              profile.avatar || '',

            user:
              req.user.userId,

            mediaFiles,

            mediaUrl:
              mediaFiles.length > 0
                ? mediaFiles[0].url
                : '',

            mediaType:
              mediaFiles.length > 0
                ? mediaFiles[0].type
                : null,

            mediaPath:
              mediaFiles.length > 0
                ? mediaFiles[0].path
                : null,

            mediaOriginalName:
              mediaFiles.length > 0
                ? mediaFiles[0].originalName
                : ''
          });

          const post =
            await newPost.save();

          // Notifications Firebase
          try {
            const users = await User.find({
              _id: { $ne: req.user.userId },
              fcmTokens: { $exists: true, $not: { $size: 0 } }
            });

            const messages = [];

            for (const user of users) {
              const lastViewedBlog = user.lastViewedBlog || new Date(0);
              const unreadCount = await Post.countDocuments({
                user: { $ne: user._id },
                date: { $gt: lastViewedBlog }
              });

              let notificationTitle = '📢 Nouvelle publication';
              let notificationBody = `${profile.firstName} ${profile.lastName} vient de publier un nouveau post.`;

              user.fcmTokens.forEach((token) => {
                messages.push({
                  token,
                  webpush: {
                    headers: { Urgency: 'high', TTL: '86400' },
                    data: {
                      title: notificationTitle,
                      body: notificationBody,
                      unreadCount: String(unreadCount),
                      url: 'https://ronaldokamdje-9589s-projects.vercel.app/blog'
                    }
                  }
                });
              });
            }

            if (messages.length > 0) {
              await admin.messaging().sendEach(messages);
            }
          } catch (firebaseErr) {
            console.error('🔥 Erreur Firebase:', firebaseErr);
          }

          const postWithLean =
            post.toObject();

          const io =
            req.app.get('io');

          if (io) {
            io.emit(
              'posts_created',
              postWithLean
            );
            io.emit(
              'article_published',
              postWithLean
            );
          }

          res.json(post);

        } catch (dbErr) {

          console.error(
            'Erreur création post:',
            dbErr
          );

          res.status(500).json({
            message:
              'Erreur serveur lors de la création de la publication.'
          });
        }
      }
    );
  }
);


// ============================================================
// DELETE /api/posts/:id
// ============================================================

router.delete(
  '/:id',
  auth,
  async (req, res) => {

    try {

      const post =
        await Post.findById(req.params.id);

      if (!post) {
        return res.status(404).json({
          message: 'Publication non trouvée.'
        });
      }

      if (
        post.user.toString() !==
        req.user.userId
      ) {
        return res.status(401).json({
          message: 'Utilisateur non autorisé à supprimer ce post.'
        });
      }

      if (
        post.mediaFiles &&
        post.mediaFiles.length > 0
      ) {
        for (
          const media of post.mediaFiles
        ) {
          if (media.path) {
            try {
              await deleteFile(media.path);
            } catch (deleteErr) {
              console.error('Erreur suppression fichier:', deleteErr.message);
            }
          }
        }
      } else if (post.mediaPath) {
        await deleteFile(post.mediaPath);
      }

      const postId = post._id;
      await post.deleteOne();

      const io = req.app.get('io');
      if (io) {
        io.emit('posts_deleted', postId);
      }

      res.json({
        message: 'Publication supprimée avec succès.'
      });

    } catch (err) {
      console.error(err.message);
      res.status(500).send('Erreur serveur lors de la suppression.');
    }
  }
);


// ============================================================
// PUT /api/posts/:id (MIS À JOUR POUR GÉRER LA SUPPRESSION CIBLÉE)
// ============================================================

router.put(
  '/:id',
  auth,
  (req, res) => {

    upload.array('media', MAX_FILES)(
      req,
      res,
      async (err) => {

        if (err) {
          return res.status(400).json({
            message: err.message
          });
        }

        try {
          const post = await Post.findById(req.params.id);

          if (!post) {
            return res.status(404).json({
              message: 'Publication non trouvée.'
            });
          }

          if (
            post.user.toString() !==
            req.user.userId
          ) {
            return res.status(401).json({
              message: 'Utilisateur non autorisé.'
            });
          }

          if (req.body.text !== undefined) {
            post.text = req.body.text;
          }

          if (req.body.category) {
            post.category = req.body.category;
          }

          // 1. Suppression ciblée des fichiers demandés par le frontend
          if (req.body.mediaToDelete) {
            try {
              const pathsToDelete = JSON.parse(req.body.mediaToDelete);
              if (Array.isArray(pathsToDelete) && pathsToDelete.length > 0) {
                for (const pathToDelete of pathsToDelete) {
                  // Supprimer physiquement du stockage Supabase
                  try {
                    await deleteFile(pathToDelete);
                  } catch (delErr) {
                    console.error('Erreur suppression stockage:', delErr.message);
                  }
                }
                // Filtrer le tableau mediaFiles pour retirer les éléments supprimés
                post.mediaFiles = post.mediaFiles.filter(
                  (m) => !pathsToDelete.includes(m.path) && !pathsToDelete.includes(m.url)
                );
              }
            } catch (parseErr) {
              console.error('Erreur parsing mediaToDelete:', parseErr);
            }
          }

          // 2. Ajout des nouveaux fichiers s'il y en a
          if (
            req.files &&
            req.files.length > 0
          ) {
            for (const file of req.files) {
              if (file.mimetype.startsWith('video/')) {
                return res.status(400).json({
                  message: 'Les vidéos ne sont pas autorisées sur HITAS.'
                });
              }

              const mediaType = getMediaType(file);
              const uploaded = await uploadFile(file, 'posts');

              post.mediaFiles.push({
                url: uploaded.url,
                path: uploaded.path,
                type: mediaType,
                originalName: file.originalname
              });
            }
          }

          // 3. Mise à jour des champs de rétrocompatibilité
          post.mediaUrl = post.mediaFiles[0]?.url || '';
          post.mediaType = post.mediaFiles[0]?.type || null;
          post.mediaPath = post.mediaFiles[0]?.path || null;
          post.mediaOriginalName = post.mediaFiles[0]?.originalName || '';

          await post.save();

          const io = req.app.get('io');
          if (io) {
            io.emit('posts_updated', post);
          }

          res.json(post);

        } catch (err) {
          console.error('Erreur modification:', err.message);
          res.status(500).send('Erreur serveur lors de la modification.');
        }
      }
    );
  }
);


// ============================================================
// LIKE & COMMENT ROUTES
// ============================================================

router.put('/like/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Publication non trouvée.' });

    const alreadyLiked = post.likes.some(
      like => like.user.toString() === req.user.userId
    );

    if (alreadyLiked) {
      post.likes = post.likes.filter(
        like => like.user.toString() !== req.user.userId
      );
    } else {
      post.likes.unshift({ user: req.user.userId });
    }

    await post.save();
    res.json(post.likes);
  } catch (err) {
    res.status(500).send('Erreur serveur.');
  }
});

router.post('/comment/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const profile = await Profile.findOne({ user: req.user.userId });

    if (!post) return res.status(404).json({ message: 'Publication non trouvée.' });
    if (!profile) return res.status(400).json({ message: 'Profil requis.' });

    const newComment = {
      user: req.user.userId,
      text: req.body.text,
      firstName: profile.firstName,
      lastName: profile.lastName,
      avatar: profile.avatar || ''
    };

    post.comments.unshift(newComment);
    await post.save();
    res.json(post.comments);
  } catch (err) {
    res.status(500).send('Erreur serveur.');
  }
});

module.exports = router;