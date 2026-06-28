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
  mediaUrl: {
    type: String
  },
  mediaType: {
    type: String,
    enum: ['image', 'video', 'audio', null],
    default: null
  },
  likes: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
      }
    }
  ],
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
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('post', PostSchema);