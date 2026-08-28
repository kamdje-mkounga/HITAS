const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Project = require('../models/Project');
const Profile = require('../models/Profile');
const upload = require('../middleware/upload'); // Utilisation du middleware Cloudinary/Multer

// @route   POST api/project
// @desc    Créer un projet avec plusieurs médias/fichiers (Images, Vidéos, PDF, etc.)
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

      // req.files contient les fichiers envoyés et stockés sur Cloudinary par le middleware
      if (req.files && req.files.length > 0) {
        for (let file of req.files) {
          const mime = file.mimetype.toLowerCase();
          let type = 'image';

          if (mime.startsWith('video/')) {
            type = 'video';
          } else if (mime === 'application/pdf') {
            type = 'pdf';
          }

          // file.path contient l'URL sécurisée renvoyée par Cloudinary
          filesData.push({
            url: file.path,
            type
          });
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
// @desc    Récupérer tous les projets
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
          project.media = [{ url: project.mediaUrl, type: project.mediaType || 'image' }];
        } else {
          project.media = [];
        }
      }

      // ÉTAPE 1 : Supprimer des fichiers individuels ciblés de la liste
      if (req.body.mediaToDelete) {
        try {
          const toDelete = JSON.parse(req.body.mediaToDelete);
          if (Array.isArray(toDelete) && toDelete.length > 0) {
            // Note: Avec Cloudinary, les fichiers restent sur le cloud (ou peuvent être supprimés via l'API Cloudinary si besoin)
            project.media = project.media.filter(item => !toDelete.includes(item.url));
          }
        } catch (parseErr) {
          console.error("Erreur lors du parse de mediaToDelete :", parseErr);
        }
      }

      // ÉTAPE 2 : Ajouter de nouveaux fichiers via Cloudinary
      if (req.files && req.files.length > 0) {
        let newFilesData = [];
        for (let file of req.files) {
          const mime = file.mimetype.toLowerCase();
          let type = 'image';

          if (mime.startsWith('video/')) {
            type = 'video';
          } else if (mime === 'application/pdf') {
            type = 'pdf';
          }

          newFilesData.push({
            url: file.path,
            type
          });
        }

        project.media = [...project.media, ...newFilesData];
      }

      // ÉTAPE 3 : Suppression totale de la galerie si demandée
      if (req.body.deleteMedia === 'true') {
        project.media = [];
      }

      // Recalcul de l'élément principal de couverture
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
// @desc    Supprimer un projet
router.delete('/:id', auth, async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: "Non autorisé." });
    }

    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Projet non trouvé.' });
    if (project.user.toString() !== req.user.userId) return res.status(401).json({ message: 'Non autorisé.' });

    await project.deleteOne();
    res.json({ message: 'Projet supprimé avec succès.' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur serveur.');
  }
});

module.exports = router;