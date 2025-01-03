const mongoose = require('mongoose');

const coachSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^\S+@\S+\.\S+$/,
  },
  phone: {
    type: String,
    required: true,
  },
  hourRate: {
    type: Number,
    required: true,
    min: 0,
  },
  category: {
    type: String,
    required: true,
    enum: ['university', 'school pst', 'school diploma', 'grads', 'CFK', 'private', 'flutter', 'frontend', 'backend'],
  },
  schedule: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CoachSchedule',
    required: true,
  },
  groups: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
    },
  ],
}, {
  timestamps: true,
});

module.exports = mongoose.model('Coach', coachSchema);
