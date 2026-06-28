const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    firstName: String,
    lastName: String,
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    technologies: {
        type: [String],
        default: []
    },
    githubUrl: {
        type: String,
        default: ""
    },
    demoUrl: {
        type: String,
        default: ""
    },
    media: [
        {
            url: {
                type: String,
                required: true
            },
            type: {
                type: String,
                // On garde l'enum, mais on s'assure d'avoir une valeur par défaut "image" au cas où le parsing échoue
                enum: ["image", "video", "pdf", "audio"],
                default: "image", 
                required: true
            }
        }
    ],
    mediaUrl: {
        type: String,
        default: ""
    },
    mediaType: {
        type: String,
        default: null
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("project", ProjectSchema);