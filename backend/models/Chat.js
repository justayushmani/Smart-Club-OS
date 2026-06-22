const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  channel: { type: String, enum: ['#announcements', '#general', '#tech-wing', '#design-wing', '#pr-wing'], required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
