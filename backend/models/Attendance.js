const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  format: { type: String, enum: ['online', 'offline'], required: true },
  attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
