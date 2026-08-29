const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        let resourceType = 'auto';
        let format = undefined;
        let publicId = '';

        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const cleanOriginalName = file.originalname.substring(0, file.originalname.lastIndexOf('.')) || file.originalname;
        const sanitizedName = cleanOriginalName.replace(/[^a-zA-Z0-9_.-]/g, '_');

        if (file.mimetype.startsWith('video/')) {
            resourceType = 'video';
            publicId = `${uniqueSuffix}-${sanitizedName}`;
        }
        else if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
            resourceType = 'image'; // 👈 On traite le PDF via le canal image de Cloudinary pour l'affichage direct
            format = 'pdf';         // 👈 Force l'extension .pdf dans l'URL générée
            publicId = `${uniqueSuffix}-${sanitizedName}`;
        } else {
            resourceType = 'image';
            publicId = `${uniqueSuffix}-${sanitizedName}`;
        }

        return {
            folder: 'hitas_projects',
            resource_type: resourceType,
            format: format,
            public_id: publicId,
        };
    },
});

const upload = multer({ storage: storage });

module.exports = upload;