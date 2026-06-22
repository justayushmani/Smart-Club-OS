const mongoose = require('mongoose');

const CandidateApplicationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  department: { type: String, enum: ['tech', 'design', 'pr'], required: true },
  cgpa: { type: Number, required: true },
  answers: [{
    questionId: { type: String, required: true },
    value: { type: String, required: true }
  }],
  stage: { 
    type: String, 
    enum: ['Applied', 'Shortlisted', 'Interview', 'Selected', 'Rejected'], 
    default: 'Applied' 
  },
  interviewSchedule: {
    date: { type: Date },
    mode: { type: String, enum: ['online', 'offline'] },
    linkOrLocation: { type: String }
  },
  evaluations: [{
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewerName: { type: String },
    score: { type: Number, min: 1, max: 10 },
    comments: { type: String },
    date: { type: Date, default: Date.now }
  }],
  dateSubmitted: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CandidateApplication', CandidateApplicationSchema);
