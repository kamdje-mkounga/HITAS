const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary credentials
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Use Multer memory storage to temporarily hold the file buffer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// POST endpoint to handle file uploads
router.post('/upload', upload.single('media'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file provided' });
        }

        // Stream the buffer directly to Cloudinary
        const uploadToCloudinary = () => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { resource_type: 'auto' }, // 'auto' handles images, videos, and PDFs automatically
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                stream.end(req.file.buffer);
            });
        };

        const cldRes = await uploadToCloudinary();

        // cldRes.secure_url contains the permanent URL to save in MongoDB!
        return res.status(200).json({
            message: 'Uploaded successfully to Cloudinary',
            url: cldRes.secure_url,
            format: cldRes.format,
            resource_type: cldRes.resource_type
        });

    } catch (err) {
        console.error("Cloudinary upload error:", err);
        res.status(500).json({ error: 'Server error during upload' });
    }
});

module.exports = router;