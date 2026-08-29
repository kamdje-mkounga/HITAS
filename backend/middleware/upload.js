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
        let publicId = '';

        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const cleanOriginalName = file.originalname.replace(/[^a-zA-Z0-9_.-]/g, '_');

        if (file.mimetype.startsWith('video/')) {
            resourceType = 'video';
            publicId = `${uniqueSuffix}-${cleanOriginalName}`;
        }
        else if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
            resourceType = 'raw'; // Stockage brut pour garder l'intégrité du PDF
            // 👈 On s'assure que le public_id se termine bien par .pdf
            publicId = `${uniqueSuffix}-${cleanOriginalName.endsWith('.pdf') ? cleanOriginalName : cleanOriginalName + '.pdf'}`;
        } else {
            resourceType = 'image';
            publicId = `${uniqueSuffix}-${cleanOriginalName}`;
        }

        return {
            folder: 'hitas_projects',
            resource_type: resourceType,
            public_id: publicId,
        };
    },
});

const upload = multer({ storage: storage });

module.exports = upload;