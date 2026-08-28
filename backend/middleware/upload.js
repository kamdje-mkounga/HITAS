const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configuration avec tes identifiants Cloudinary (depuis le .env)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configuration du stockage intelligent pour Multer
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        let resourceType = 'auto'; // Détecte automatiquement (image, vidéo, raw)

        // Si c'est une vidéo, on force le type ressource vidéo pour le streaming
        if (file.mimetype.startsWith('video/')) {
            resourceType = 'video';
        }

        return {
            folder: 'hitas_projects',
            resource_type: resourceType,
            allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'mp4', 'mov', 'webm', 'pdf'],
        };
    },
});

const upload = multer({ storage: storage });

module.exports = upload;