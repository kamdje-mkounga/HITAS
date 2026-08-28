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
        let resourceType = 'auto';
        let format = undefined;

        // Si c'est une vidéo
        if (file.mimetype.startsWith('video/')) {
            resourceType = 'video';
        }
        // Si c'est un PDF, on force le format pour que Cloudinary le serve proprement avec l'extension .pdf
        else if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
            resourceType = 'auto';
            format = 'pdf';
        }

        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const cleanFileName = file.originalname.substring(0, file.originalname.lastIndexOf('.')) || file.originalname;

        return {
            folder: 'hitas_projects',
            resource_type: resourceType,
            format: format, // Force l'extension .pdf pour le rendu dans le navigateur
            public_id: `${uniqueSuffix}-${cleanFileName}`,
            allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'mp4', 'mov', 'webm', 'pdf'],
        };
    },
});

const upload = multer({ storage: storage });

module.exports = upload;