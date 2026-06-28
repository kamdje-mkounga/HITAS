const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); 
const Project = require('../models/Project'); 
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
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 Mo max au total
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|webp|mp4|mov|m4v|webm|quicktime|pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Format non supporté ! Choisissez des images, vidéos ou un document PDF.'));
    }
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
          const url = `/uploads/${file.filename}`;
          const mime = file.mimetype.toLowerCase();
          const ext = path.extname(file.originalname).toLowerCase();
          let type = 'image';

          if (mime.startsWith('video') || ['.mp4', '.mov', '.qt', '.webm', '.m4v'].includes(ext)) {
            type = 'video';
            const pathToFile = path.join(__dirname, '../', url);
            try {
              const duration = await getVideoDurationInSeconds(pathToFile);
              if (duration > 180) {
                fs.unlinkSync(pathToFile);
                return res.status(400).json({ message: "L'une de vos vidéos dépasse les 3 minutes maximales." });
              }
            } catch (durationErr) {
              console.error("Erreur durée vidéo :", durationErr);
            }
          } else if (mime === 'application/pdf' || ext === '.pdf') {
            type = 'pdf';
          }

          filesData.push({ url, type });
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
        mediaType: filesData.length > 0 ? filesData[0].type : null
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
// @desc    Récupérer tous les projets (Sécurisée pour la rétrocompatibilité)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find().sort({ date: -1 }).lean();
    
    const securedProjects = projects.map(project => {
      if (!project.media || !Array.isArray(project.media)) {
        if (project.mediaUrl) {
          project.media = [{ url: project.mediaUrl, type: project.mediaType || 'image' }];
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
// @desc    Modifier un projet (Gestion fine, ajout et suppressions ciblées de la galerie)
// @access  Private
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
      
      // 🛠️ CORRECTIF : Gestion sécurisée du champ technologies (évite le crash si vide)
      if (req.body.technologies !== undefined) {
        if (typeof req.body.technologies === 'string' && req.body.technologies.trim() !== '') {
          project.technologies = req.body.technologies.split(',').map(tech => tech.trim());
        } else {
          project.technologies = []; // Si vide ou effacé, on nettoie proprement le tableau
        }
      }

      // 🛡️ INITIALISATION / SÉCURISATION DU TABLEAU MEDIA (Évite l'erreur Not Iterable)
      if (!project.media || !Array.isArray(project.media)) {
        if (project.mediaUrl) {
          project.media = [{ url: project.mediaUrl, type: project.mediaType || 'image' }];
        } else {
          project.media = [];
        }
      }

      // 🛠️ ÉTAPE 1 : Gestion des suppressions individuelles demandées par le front
      if (req.body.mediaToDelete) {
        try {
          const toDelete = JSON.parse(req.body.mediaToDelete);
          if (Array.isArray(toDelete) && toDelete.length > 0) {
            toDelete.forEach(fileUrl => {
              const filePath = path.join(__dirname, '../', fileUrl);
              if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
              }
            });
            project.media = project.media.filter(item => !toDelete.includes(item.url));
          }
        } catch (parseErr) {
          console.error("Erreur lors du parse de mediaToDelete :", parseErr);
        }
      }

      // 🛠️ ÉTAPE 2 : Traitement et ajout des nouveaux fichiers téléversés à la suite
      if (req.files && req.files.length > 0) {
        let newFilesData = [];
        for (let file of req.files) {
          const url = `/uploads/${file.filename}`;
          const mime = file.mimetype.toLowerCase();
          const ext = path.extname(file.originalname).toLowerCase();
          let type = 'image';

          if (mime.startsWith('video') || ['.mp4', '.mov', '.qt', '.webm', '.m4v'].includes(ext)) {
            type = 'video';
            const pathToFile = path.join(__dirname, '../', url);
            try {
              const duration = await getVideoDurationInSeconds(pathToFile);
              if (duration > 180) {
                fs.unlinkSync(pathToFile);
                return res.status(400).json({ message: "Une vidéo dépasse la limite de 3 minutes." });
              }
            } catch (dErr) { console.error(dErr); }
          } else if (mime === 'application/pdf' || ext === '.pdf') {
            type = 'pdf';
          }

          newFilesData.push({ url, type });
        }

        project.media = [...project.media, ...newFilesData];
      }

      // 🛠️ ÉTAPE 3 : Rétrocompatibilité et nettoyage de secours si demande globale de vidage complet
      if (req.body.deleteMedia === 'true') {
        if (project.media && project.media.length > 0) {
          project.media.forEach(file => {
            const oldPath = path.join(__dirname, '../', file.url);
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
          });
        }
        project.media = [];
      }

      // Recalcul des valeurs par défaut principales pour l'affichage de couverture global
      if (project.media && project.media.length > 0) {
        project.mediaUrl = project.media[0].url;
        project.mediaType = project.media[0].type;
      } else {
        project.mediaUrl = '';
        project.mediaType = null;
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
// @desc    Supprimer un projet et nettoyer tous ses fichiers joints
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: "Non autorisé." });
    }

    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Projet non trouvé.' });
    if (project.user.toString() !== req.user.userId) return res.status(401).json({ message: 'Non autorisé.' });

    if (project.media && project.media.length > 0) {
      project.media.forEach(file => {
        const pathToMedia = path.join(__dirname, '../', file.url);
        if (fs.existsSync(pathToMedia)) fs.unlinkSync(pathToMedia);
      });
    } else if (project.mediaUrl) {
      const pathToMedia = path.join(__dirname, '../', project.mediaUrl);
      if (fs.existsSync(pathToMedia)) fs.unlinkSync(pathToMedia);
    }

    await project.deleteOne();
    res.json({ message: 'Projet supprimé ainsi que tous ses médias.' });
  } catch (err) {
    res.status(500).send('Erreur serveur.');
  }
});

module.exports = router;