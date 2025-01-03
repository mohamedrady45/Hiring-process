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
  requests: [
    {
      studentName: {
        type: String,
        required: true,
      },
      studentEmail: {
        type: String,
        required: true,
      },
      studentPhone: {
        type: String,
        required: true,
      },
      paid: {
        type: Boolean,
        default: false, // لو مش مدفوع يبقى false
      },
      requestDate: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  pauseEndDate: {
    type: Date, 
  },
  enrolledStudents: [
    {
      studentName: {
        type: String,
        required: true,
      },
      studentEmail: {
        type: String,
        required: true,
      },
      studentPhone: {
        type: String,
        required: true,
      },
      enrolledDate: {
        type: Date,
        default: Date.now,
      },
    },
  ],
}, {
  timestamps: true,
});

module.exports = mongoose.model('Group', groupSchema);
