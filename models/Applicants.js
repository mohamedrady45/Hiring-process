const mongoose = require('mongoose');

const applicantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  cv: { 
    type: String,
    required: true,
  },
});

const applicationSchema = new mongoose.Schema({
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Applicant',
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Rejected'],
    default: 'Pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  interviewDate: {
    type: Date,
    default: new Date('2024-10-25T09:00:00Z'),
  },
  feedback: {
    type: String,
    default: 'No feedback provided',
  },
  meetingLink: {
    type: String,
  },
  interviewer: {
    type: String,
    enum: ['Rady', 'Mnesy', 'Mohamed Ibrahim'],
  },
});


const Applicant = mongoose.model('Applicant', applicantSchema);
const Application = mongoose.model('Application', applicationSchema);

module.exports = { Applicant, Application };
