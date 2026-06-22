const express = require('express');
const ChatMessage = require('../models/Chat');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/:channel', protect, async (req, res) => {
  const channel = `#${req.params.channel}`;
  try {
    const messages = await ChatMessage.find({ channel }).populate('sender', 'username role').sort({ timestamp: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/:channel', protect, async (req, res) => {
  const channel = `#${req.params.channel}`;
  const { text } = req.body;

  try {
    if (channel === '#announcements' && req.user.role !== 'president') {
      return res.status(403).json({ message: 'Only president can post in announcements' });
    }

    const message = await ChatMessage.create({ channel, sender: req.user._id, text });
    const populatedMessage = await message.populate('sender', 'username role');
    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
