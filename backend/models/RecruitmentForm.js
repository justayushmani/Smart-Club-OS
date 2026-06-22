const mongoose = require('mongoose');

const RecruitmentFormSchema = new mongoose.Schema({
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isActive: { type: Boolean, default: true },
  questions: [{
    id: { type: String, required: true },
    label: { type: String, required: true },
    type: { type: String, enum: ['text', 'textarea', 'dropdown'], required: true },
    options: [String],
    required: { type: Boolean, default: true }
  }],
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('RecruitmentForm', RecruitmentFormSchema);
