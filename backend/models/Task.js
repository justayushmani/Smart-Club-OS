const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  department: { type: String, enum: ['tech', 'design', 'pr', 'common'], required: true },
  description: { type: String, required: true },
  assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  stage: { type: String, enum: ['todo', 'progress', 'done'], default: 'todo' },
  deadline: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
