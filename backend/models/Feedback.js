const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  text: { type: String, required: true },
  category: { type: String, required: true },
  isAnonymous: { type: Boolean, default: false },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['Submitted', 'In Progress', 'Resolved'], default: 'Submitted' },
  resolutionNotes: { type: String },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Feedback', feedbackSchema);
