const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); 
const Project = require('../models/Project'); 
const Profile = require('../models/Profile');
const multer = require('multer');
const { uploadFile, deleteFile } = require("../utils/supabaseStorage");

// Configuration du stockage de Multer en mémoire
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 Mo max
  fileFilter: (req, file, cb) => {
    // 🚫 Videos are not allowed
    if (file.mimetype.startsWith('video/')) {
      return cb(new Error("Les vidéos ne sont pas autorisées pour les projets."));
    }

    const filetypes =
      /jpeg|jpg|png|gif|webp|pdf|msword|vnd.openxmlformats-officedocument.wordprocessingml.document/;

    const ext = file.originalname.split('.').pop().toLowerCase();

    const isExtValid =
      filetypes.test(ext) || ['doc', 'docx'].includes(ext);

    const isMimeValid = filetypes.test(file.mimetype);

    if (isMimeValid || isExtValid) {
      return cb(null, true);
    }

    cb(new Error(
      'Format non supporté ! Choisissez des images, PDF ou documents Word.'
    ));
  }
});

// @route   POST api/project
// @desc    Créer un projet avec plusieurs médias/fichiers
// @access  Private
router.post('/', auth, (req, res) => {
  upload.array('media', 6)(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    try {
      if (!req.user || !req.user.userId) {
        return res.status(401).json({ message: "Utilisateur non identifié." });
      }

      const profile = await Profile.findOne({ user: req.user.userId });
      if (!profile) {
        return res.status(400).json({ message: "Tu dois créer un profil avant de publier un projet." });
      }

      let filesData = [];

      if (req.files && req.files.length > 0) {
        for (let file of req.files) {
          const mime = file.mimetype.toLowerCase();
          const ext = file.originalname.split('.').pop().toLowerCase();
          let type = 'image';

          if (mime.startsWith('video') || ['mp4', 'mov', 'qt', 'webm', 'm4v'].includes(ext)) {
            type = 'video';
            try {
              const stream = Readable.from(file.buffer);
              const duration = await getVideoDurationInSeconds(stream);
              if (duration > 180) {
                return res.status(400).json({ message: "L'une de vos vidéos dépasse les 3 minutes maximales." });
              }
            } catch (durationErr) {
              console.error("Erreur durée vidéo :", durationErr);
            }
          } else if (mime === 'application/pdf' || ext === '.pdf') {
            type = 'pdf';
          }

          // Envoi sur Supabase Storage (dans un dossier/bucket "projects")
          const uploaded = await uploadFile(file, "projects");
          filesData.push({ url: uploaded.url, path: uploaded.path, type });
        }
      }

      let technologies = [];
      if (req.body.technologies && req.body.technologies.trim() !== '') {
        technologies = req.body.technologies.split(',').map(tech => tech.trim());
      }

      const newProject = new Project({
        user: req.user.userId,
        title: req.body.title,
        description: req.body.description,
        technologies,
        githubUrl: req.body.githubUrl || '',
        demoUrl: req.body.demoUrl || '',
        firstName: profile.firstName,
        lastName: profile.lastName,
        media: filesData,
        mediaUrl: filesData.length > 0 ? filesData[0].url : '',
        mediaType: filesData.length > 0 ? filesData[0].type : null,
        mediaPath: filesData.length > 0 ? filesData[0].path : null
      });

      const project = await newProject.save();
      res.json(project);
    } catch (dbErr) {
      console.error(dbErr);
      res.status(500).send('Erreur serveur lors du partage du projet.');
    }
  });
});

// @route   GET api/project
// @desc    Récupérer tous les projets
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find().sort({ date: -1 }).lean();
    
    const securedProjects = projects.map(project => {
      if (!project.media || !Array.isArray(project.media)) {
        if (project.mediaUrl) {
          project.media = [{ url: project.mediaUrl, path: project.mediaPath || null, type: project.mediaType || 'image' }];
        } else {
          project.media = [];
        }
      }
      return project;
    });

    res.json(securedProjects);
  } catch (err) {
    console.error("Erreur GET api/project :", err.message);
    res.status(500).send('Erreur serveur lors de la récupération des projets.');
  }
});

// @route   PUT api/project/:id
// @desc    Modifier un projet
router.put('/:id', auth, (req, res) => {
  upload.array('media', 6)(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    try {
      if (!req.user || !req.user.userId) {
        return res.status(401).json({ message: "Non autorisé." });
      }

      let project = await Project.findById(req.params.id);
      if (!project) return res.status(404).json({ message: 'Projet non trouvé.' });
      if (project.user.toString() !== req.user.userId) return res.status(401).json({ message: 'Non autorisé.' });

      if (req.body.title) project.title = req.body.title;
      if (req.body.description) project.description = req.body.description;
      if (req.body.githubUrl !== undefined) project.githubUrl = req.body.githubUrl;
      if (req.body.demoUrl !== undefined) project.demoUrl = req.body.demoUrl;
      
      if (req.body.technologies !== undefined) {
        if (typeof req.body.technologies === 'string' && req.body.technologies.trim() !== '') {
          project.technologies = req.body.technologies.split(',').map(tech => tech.trim());
        } else {
          project.technologies = [];
        }
      }

      if (!project.media || !Array.isArray(project.media)) {
        if (project.mediaUrl) {
          project.media = [{ url: project.mediaUrl, path: project.mediaPath || null, type: project.mediaType || 'image' }];
        } else {
          project.media = [];
        }
      }

      // ÉTAPE 1 : Supprimer des fichiers individuels ciblés
      if (req.body.mediaToDelete) {
        try {
          const toDelete = JSON.parse(req.body.mediaToDelete);
          if (Array.isArray(toDelete) && toDelete.length > 0) {
            for (let fileUrl of toDelete) {
              const targetItem = project.media.find(item => item.url === fileUrl);
              if (targetItem && targetItem.path) {
                await deleteFile(targetItem.path);
              }
            }
            project.media = project.media.filter(item => !toDelete.includes(item.url));
          }
        } catch (parseErr) {
          console.error("Erreur lors du parse de mediaToDelete :", parseErr);
        }
      }

      // ÉTAPE 2 : Ajouter de nouveaux fichiers sur Supabase
      if (req.files && req.files.length > 0) {
        let newFilesData = [];
        for (let file of req.files) {
          const mime = file.mimetype.toLowerCase();
          const ext = file.originalname.split('.').pop().toLowerCase();
          let type = 'image';

          if (mime.startsWith('video') || ['mp4', 'mov', 'qt', 'webm', 'm4v'].includes(ext)) {
            type = 'video';
            try {
              const stream = Readable.from(file.buffer);
              const duration = await getVideoDurationInSeconds(stream);
              if (duration > 180) {
                return res.status(400).json({ message: "Une vidéo dépasse la limite de 3 minutes." });
              }
            } catch (dErr) { console.error(dErr); }
          } else if (mime === 'application/pdf' || ext === '.pdf') {
            type = 'pdf';
          }

          const uploaded = await uploadFile(file, "projects");
          newFilesData.push({ url: uploaded.url, path: uploaded.path, type });
        }

        project.media = [...project.media, ...newFilesData];
      }

      // ÉTAPE 3 : Suppression totale de la galerie si demandée
      if (req.body.deleteMedia === 'true') {
        if (project.media && project.media.length > 0) {
          for (let file of project.media) {
            if (file.path) await deleteFile(file.path);
          }
        }
        project.media = [];
      }

      // Recalcul de l'image principale de couverture
      if (project.media && project.media.length > 0) {
        project.mediaUrl = project.media[0].url;
        project.mediaType = project.media[0].type;
        project.mediaPath = project.media[0].path || null;
      } else {
        project.mediaUrl = '';
        project.mediaType = null;
        project.mediaPath = null;
      }

      const updatedProject = await project.save();
      res.json(updatedProject);
    } catch (err) {
      console.error(err);
      res.status(500).send('Erreur serveur lors du traitement de la modification.');
    }
  });
});

// @route   DELETE api/project/:id
// @desc    Supprimer un projet et nettoyer tous ses fichiers joints sur Supabase
router.delete('/:id', auth, async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: "Non autorisé." });
    }

    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Projet non trouvé.' });
    if (project.user.toString() !== req.user.userId) return res.status(401).json({ message: 'Non autorisé.' });

    // Nettoyage de tous les fichiers sur Supabase Storage
    if (project.media && project.media.length > 0) {
      for (let file of project.media) {
        if (file.path) await deleteFile(file.path);
      }
    } else if (project.mediaPath) {
      await deleteFile(project.mediaPath);
    }

    await project.deleteOne();
    res.json({ message: 'Projet supprimé ainsi que tous ses médias.' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur serveur.');
  }
});

module.exports = router;