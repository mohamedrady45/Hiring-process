const mongoose = require('mongoose');

const studentHistorySchema = new mongoose.Schema({
  studentEmail: {
    type: String,
    required: true,
  },
  actions: [
    {
      action: {
        type: String,
        enum: ['enrolled', 'removed', 'transferred'],
        required: true,
      },
      fromGroup: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        required: false,
      },
      toGroup: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        required: false,
      },
      date: {
        type: Date,
        default: Date.now,
      },
      description: {
        type: String,
      },
    },
  ],
}, {
  timestamps: true,
});

module.exports = mongoose.model('StudentHistory', studentHistorySchema);
