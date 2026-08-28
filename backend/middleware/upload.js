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
        // 🛠️ SOLUTION RADICALE POUR LES PDF : On utilise le type 'raw'
        else if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
            resourceType = 'raw'; // Stocke le fichier tel quel sans tentative de transformation en image
        }

        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const cleanFileName = file.originalname.substring(0, file.originalname.lastIndexOf('.')) || file.originalname;

        const uploadParams = {
            folder: 'hitas_projects',
            resource_type: resourceType,
            public_id: `${uniqueSuffix}-${cleanFileName}`
        };

        // Si ce n'est pas un fichier raw, on peut restreindre les formats
        if (resourceType !== 'raw') {
            uploadParams.allowed_formats = ['jpg', 'png', 'jpeg', 'webp', 'mp4', 'mov', 'webm'];
        }

        return uploadParams;
    },
});

const upload = multer({ storage: storage });

module.exports = upload;