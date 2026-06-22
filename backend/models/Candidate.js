const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  domain: { type: String, enum: ['tech', 'design', 'pr'], required: true },
  cgpa: { type: Number, required: true },
  stage: { type: String, enum: ['applied', 'test', 'interview', 'selected'], default: 'applied' },
  testScore: { type: Number },
  interviewNotes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Candidate', candidateSchema);
