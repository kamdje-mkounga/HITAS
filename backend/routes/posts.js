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
      'docx'
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
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
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

  // 🚫 Sécurité supplémentaire
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
    mime.includes(
      'vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) ||
    ['doc', 'docx'].includes(ext)
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

        // Avatar auteur
        if (post.user) {

          const userProfile = await Profile
            .findOne({ user: post.user })
            .select('avatar');

          if (userProfile?.avatar) {
            post.avatar = userProfile.avatar;
          }
        }


        // Avatars commentaires
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


        // Compatibilité avec anciennes publications
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
// Créer une publication avec plusieurs fichiers
// ============================================================

router.post(
  '/',
  auth,
  (req, res) => {

    upload.array('media', MAX_FILES)(
      req,
      res,
      async (err) => {

        // Erreur Multer
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


          // Aucun texte + aucun fichier
          if (
            !req.body.text?.trim() &&
            (!req.files || req.files.length === 0)
          ) {

            return res.status(400).json({
              message:
                'La publication doit contenir du texte ou au moins un fichier.'
            });
          }


          // ==================================================
          // UPLOAD DES FICHIERS
          // ==================================================

          const mediaFiles = [];

          if (
            req.files &&
            req.files.length > 0
          ) {

            for (const file of req.files) {

              // Sécurité vidéo
              if (
                file.mimetype &&
                file.mimetype.startsWith('video/')
              ) {

                return res.status(400).json({
                  message:
                    'Les vidéos ne sont pas autorisées sur HITAS.'
                });
              }


              const mediaType =
                getMediaType(file);


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


          // ==================================================
          // CRÉATION POST
          // ==================================================

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

            // Compatibilité ancienne structure
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


          // ==================================================
          // NOTIFICATIONS FIREBASE
          // ==================================================

          try {

            const users = await User.find({
              _id: {
                $ne: req.user.userId
              },

              fcmTokens: {
                $exists: true,
                $not: { $size: 0 }
              }
            });


            const messages = [];


            for (const user of users) {

              const lastViewedBlog =
                user.lastViewedBlog ||
                new Date(0);


              const unreadCount =
                await Post.countDocuments({
                  user: {
                    $ne: user._id
                  },

                  date: {
                    $gt: lastViewedBlog
                  }
                });


              let notificationTitle =
                '📢 Nouvelle publication';

              let notificationBody =
                `${profile.firstName} ${profile.lastName} vient de publier un nouveau post.`;


              if (unreadCount > 1) {

                notificationTitle =
                  `📢 ${unreadCount} nouveautés sur HITAS`;

                notificationBody =
                  `Vous avez ${unreadCount} publications non lues qui vous attendent !`;
              }


              user.fcmTokens.forEach(
                (token) => {

                  messages.push({

                    token,

                    webpush: {

                      headers: {
                        Urgency: 'high',
                        TTL: '86400'
                      },

                      data: {

                        title:
                          notificationTitle,

                        body:
                          notificationBody,

                        unreadCount:
                          String(unreadCount),

                        icon:
                          'https://hitas.onrender.com/hitas_logo.svg',

                        badge:
                          'https://hitas.onrender.com/hitas_logo.svg',

                        url:
                          'https://ronaldokamdje-9589s-projects.vercel.app/blog'
                      }
                    },

                    apns: {

                      headers: {
                        'apns-priority': '10'
                      },

                      payload: {

                        aps: {

                          badge:
                            Number(unreadCount),

                          sound:
                            'default',

                          'mutable-content':
                            1
                        }
                      }
                    }
                  });
                }
              );
            }


            if (messages.length > 0) {

              const response =
                await admin
                  .messaging()
                  .sendEach(messages);


              console.log(
                `✅ ${response.successCount}/${messages.length} notifications envoyées.`
              );
            }

          } catch (firebaseErr) {

            console.error(
              '🔥 Erreur Firebase:',
              firebaseErr
            );
          }


          // ==================================================
          // SOCKET.IO
          // ==================================================

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
          message:
            'Publication non trouvée.'
        });
      }


      if (
        post.user.toString() !==
        req.user.userId
      ) {

        return res.status(401).json({
          message:
            'Utilisateur non autorisé à supprimer ce post.'
        });
      }


      // ==================================================
      // SUPPRESSION DE TOUS LES FICHIERS
      // ==================================================

      if (
        post.mediaFiles &&
        post.mediaFiles.length > 0
      ) {

        for (
          const media of post.mediaFiles
        ) {

          if (media.path) {

            try {

              await deleteFile(
                media.path
              );

            } catch (deleteErr) {

              console.error(
                'Erreur suppression fichier:',
                deleteErr.message
              );
            }
          }
        }

      } else if (post.mediaPath) {

        // Anciennes publications
        await deleteFile(
          post.mediaPath
        );
      }


      const postId =
        post._id;


      await post.deleteOne();


      // ==================================================
      // SOCKET
      // ==================================================

      const io =
        req.app.get('io');

      if (io) {

        io.emit(
          'posts_deleted',
          postId
        );
      }


      // ==================================================
      // FIREBASE BADGE
      // ==================================================

      try {

        const usersToUpdate =
          await User.find({
            _id: {
              $ne: req.user.userId
            },

            fcmTokens: {
              $exists: true,
              $not: { $size: 0 }
            }
          });


        const badgeMessages = [];


        for (
          const user of usersToUpdate
        ) {

          const lastViewedBlog =
            user.lastViewedBlog ||
            new Date(0);


          const newUnreadCount =
            await Post.countDocuments({
              user: {
                $ne: user._id
              },

              date: {
                $gt: lastViewedBlog
              }
            });


          user.fcmTokens.forEach(
            token => {

              badgeMessages.push({

                token,

                data: {

                  action:
                    'DELETE_POST',

                  unreadCount:
                    String(
                      newUnreadCount
                    )
                },

                apns: {

                  payload: {

                    aps: {

                      badge:
                        newUnreadCount,

                      'content-available':
                        1
                    }
                  }
                }
              });
            }
          );
        }


        if (
          badgeMessages.length > 0
        ) {

          await admin
            .messaging()
            .sendEach(
              badgeMessages
            );
        }

      } catch (firebaseErr) {

        console.error(
          '🔥 Erreur Firebase badge:',
          firebaseErr
        );
      }


      res.json({
        message:
          'Publication supprimée avec succès.'
      });

    } catch (err) {

      console.error(
        err.message
      );

      res.status(500).send(
        'Erreur serveur lors de la suppression.'
      );
    }
  }
);


// ============================================================
// PUT /api/posts/:id
// MODIFICATION D'UNE PUBLICATION
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

          console.error(
            'Erreur Multer modification:',
            err.message
          );

          return res.status(400).json({
            message: err.message
          });
        }


        try {

          const post =
            await Post.findById(
              req.params.id
            );


          if (!post) {

            return res.status(404).json({
              message:
                'Publication non trouvée.'
            });
          }


          if (
            post.user.toString() !==
            req.user.userId
          ) {

            return res.status(401).json({
              message:
                'Utilisateur non autorisé.'
            });
          }


          if (
            req.body.text !== undefined
          ) {

            post.text =
              req.body.text;
          }


          if (
            req.body.category
          ) {

            post.category =
              req.body.category;
          }


          // ==================================================
          // NOUVEAUX FICHIERS
          // ==================================================

          if (
            req.files &&
            req.files.length > 0
          ) {

            // Supprimer anciens fichiers
            if (
              post.mediaFiles &&
              post.mediaFiles.length > 0
            ) {

              for (
                const media of post.mediaFiles
              ) {

                if (media.path) {

                  try {

                    await deleteFile(
                      media.path
                    );

                  } catch (e) {

                    console.error(
                      'Erreur suppression ancien fichier:',
                      e.message
                    );
                  }
                }
              }

            } else if (
              post.mediaPath
            ) {

              await deleteFile(
                post.mediaPath
              );
            }


            const newMediaFiles = [];


            for (
              const file of req.files
            ) {

              if (
                file.mimetype.startsWith(
                  'video/'
                )
              ) {

                return res.status(400).json({
                  message:
                    'Les vidéos ne sont pas autorisées sur HITAS.'
                });
              }


              const mediaType =
                getMediaType(file);


              const uploaded =
                await uploadFile(
                  file,
                  'posts'
                );


              newMediaFiles.push({

                url:
                  uploaded.url,

                path:
                  uploaded.path,

                type:
                  mediaType,

                originalName:
                  file.originalname
              });
            }


            post.mediaFiles =
              newMediaFiles;


            // Compatibilité
            post.mediaUrl =
              newMediaFiles[0]?.url ||
              '';

            post.mediaType =
              newMediaFiles[0]?.type ||
              null;

            post.mediaPath =
              newMediaFiles[0]?.path ||
              null;

            post.mediaOriginalName =
              newMediaFiles[0]?.originalName ||
              '';

          } else if (
            req.body.existingMediaUrl === ''
          ) {

            // Supprimer tous les anciens fichiers
            if (
              post.mediaFiles &&
              post.mediaFiles.length > 0
            ) {

              for (
                const media of post.mediaFiles
              ) {

                if (media.path) {

                  try {

                    await deleteFile(
                      media.path
                    );

                  } catch (e) {

                    console.error(
                      e.message
                    );
                  }
                }
              }
            }


            post.mediaFiles = [];

            post.mediaUrl = '';
            post.mediaType = null;
            post.mediaPath = null;
            post.mediaOriginalName = '';
          }


          await post.save();


          // ==================================================
          // SOCKET
          // ==================================================

          const postObj =
            post.toObject();


          if (postObj.user) {

            const userProfile =
              await Profile
                .findOne({
                  user: postObj.user
                })
                .select('avatar');


            if (
              userProfile?.avatar
            ) {

              postObj.avatar =
                userProfile.avatar;
            }
          }


          const io =
            req.app.get('io');


          if (io) {

            const senderSocketId =
              req.body.socketId;


            if (senderSocketId) {

              io
                .except(senderSocketId)
                .emit(
                  'posts_updated',
                  postObj
                );

            } else {

              io.emit(
                'posts_updated',
                postObj
              );
            }
          }


          res.json(post);

        } catch (err) {

          console.error(
            'Erreur modification:',
            err.message
          );

          res.status(500).send(
            'Erreur serveur lors de la modification.'
          );
        }
      }
    );
  }
);


// ============================================================
// LIKE
// ============================================================

router.put(
  '/like/:id',
  auth,
  async (req, res) => {

    try {

      const post =
        await Post.findById(
          req.params.id
        );


      if (!post) {

        return res.status(404).json({
          message:
            'Publication non trouvée.'
        });
      }


      const alreadyLiked =
        post.likes.some(
          like =>
            like.user.toString() ===
            req.user.userId
        );


      if (alreadyLiked) {

        post.likes =
          post.likes.filter(
            like =>
              like.user.toString() !==
              req.user.userId
          );

      } else {

        post.likes.unshift({
          user:
            req.user.userId
        });
      }


      await post.save();


      const updatedPost =
        await Post
          .findById(req.params.id)
          .lean();


      if (updatedPost.user) {

        const profile =
          await Profile
            .findOne({
              user: updatedPost.user
            })
            .select('avatar');


        if (profile?.avatar) {
          updatedPost.avatar =
            profile.avatar;
        }
      }


      const io =
        req.app.get('io');


      if (io) {

        const senderSocketId =
          req.body.socketId;


        if (senderSocketId) {

          io
            .except(senderSocketId)
            .emit(
              'posts_updated_interactions',
              updatedPost
            );

        } else {

          io.emit(
            'posts_updated_interactions',
            updatedPost
          );
        }
      }


      res.json(
        post.likes
      );

    } catch (err) {

      console.error(
        err.message
      );

      res.status(500).send(
        'Erreur serveur lors de la gestion du like.'
      );
    }
  }
);


// ============================================================
// COMMENTAIRE
// ============================================================

router.post(
  '/comment/:id',
  auth,
  async (req, res) => {

    try {

      const post =
        await Post.findById(
          req.params.id
        );

      const profile =
        await Profile.findOne({
          user:
            req.user.userId
        });


      if (!post) {

        return res.status(404).json({
          message:
            'Publication non trouvée.'
        });
      }


      if (!profile) {

        return res.status(400).json({
          message:
            'Tu dois créer un profil avant de pouvoir commenter.'
        });
      }


      if (
        !req.body.text?.trim()
      ) {

        return res.status(400).json({
          message:
            'Le commentaire ne peut pas être vide.'
        });
      }


      const newComment = {

        user:
          req.user.userId,

        text:
          req.body.text,

        firstName:
          profile.firstName,

        lastName:
          profile.lastName,

        avatar:
          profile.avatar || ''
      };


      post.comments.unshift(
        newComment
      );


      await post.save();


      const updatedPost =
        await Post
          .findById(req.params.id)
          .lean();


      if (updatedPost.user) {

        const userProfile =
          await Profile
            .findOne({
              user:
                updatedPost.user
            })
            .select('avatar');


        if (
          userProfile?.avatar
        ) {

          updatedPost.avatar =
            userProfile.avatar;
        }
      }


      const io =
        req.app.get('io');


      if (io) {

        const senderSocketId =
          req.body.socketId;


        if (senderSocketId) {

          io
            .except(senderSocketId)
            .emit(
              'posts_updated_interactions',
              updatedPost
            );

        } else {

          io.emit(
            'posts_updated_interactions',
            updatedPost
          );
        }
      }


      res.json(
        updatedPost.comments
      );

    } catch (err) {

      console.error(
        'Erreur commentaire:',
        err.message
      );

      res.status(500).send(
        "Erreur serveur lors de l'ajout du commentaire."
      );
    }
  }
);


module.exports = router;