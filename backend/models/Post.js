const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },

  firstName: {
    type: String,
    required: true
  },

  lastName: {
    type: String,
    required: true
  },

  avatar: {
    type: String
  },

  text: {
    type: String,
    required: false
  },

  category: {
    type: String,
    enum: ['General', 'Entraide', 'Stage/Emploi', 'Logement'],
    default: 'General'
  },

  // ============================================================
  // 📸 MULTIPLE MEDIA FILES
  // ============================================================
  media: [
    {
      url: {
        type: String,
        required: true
      },

      path: {
        type: String,
        required: true
      },

      originalName: {
        type: String,
        default: ''
      },

      type: {
        type: String,
        enum: ['image', 'audio', 'pdf', 'document', 'file'],
        required: true
      }
    }
  ],

  // ============================================================
  // 🔄 ANCIENS CHAMPS
  // Gardés pour assurer la compatibilité avec les anciennes
  // publications déjà enregistrées dans MongoDB.
  // ============================================================

  mediaUrl: {
    type: String
  },

  mediaPath: {
    type: String
  },

  mediaOriginalName: {
    type: String,
    default: ''
  },

  mediaType: {
    type: String,
    enum: ['image', 'audio', 'pdf', 'document', 'file'],
    default: null
  },

  // ============================================================
  // ❤️ LIKES
  // ============================================================

  likes: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
      }
    }
  ],

  // ============================================================
  // 💬 COMMENTS
  // ============================================================

  comments: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
      },

      text: {
        type: String,
        required: true
      },

      firstName: {
        type: String
      },

      lastName: {
        type: String
      },

      avatar: {
        type: String
      },

      date: {
        type: Date,
        default: Date.now
      }
    }
  ],

  // ============================================================
  // 📅 DATE
  // ============================================================

  date: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model('post', PostSchema);