const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  level: {
    type: Number,
    required: true,
    enum: [1, 2, 3, 4],
  },
  startDate: {
    type: Date,
    required: true,
  },
  numberOfWeeks: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['university', 'school pst', 'school diploma', 'grads', 'CFK', 'private', 'flutter', 'frontend', 'backend'],
  },
  seats: {
    type: Number,
    required: true,
  },
  sessions: [
    {
      day: {
        type: String,
        enum: ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        required: true,
      },
      time: {
        type: String,
        required: true,
        match: /^([0-9]{2}):([0-9]{2})$/,
      },
      sessionDate: {
        type: Date,  
        required: false,
      },
      feedback: {
        type: String,
        enum: ['done', 'cancelled', 'postponed', 'upcoming'],
        default: 'upcoming',
      },
      customFeedback: {
        type: String,
        default: 'no feedback yet',
      },
    },
  ],
  isFinished: {
    type: Boolean,
    default: false,
  },
  paused: {
    type: Boolean,
    default: false,
  },
  pausedDate: {
    type: Date,
  },
  resumeDate: {
    type: Date,
  },
  pauseEndDate: {
    type: Date, 
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Group', groupSchema);
