// models/University.js
const mongoose = require('mongoose');

const universitySchema = new mongoose.Schema({
    name: { type: String, required: true },
    country: { type: String, required: true },
    city: { type: String, required: true },
    description: { type: String },
    image: { type: String, required: true }, // Main cover image URL from Cloudinary
    media: [
        {
            url: { type: String, required: true },
            caption: { type: String }
        }
    ]
});

module.exports = mongoose.model('University', universitySchema);