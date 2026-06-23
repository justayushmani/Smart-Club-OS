const express = require('express');
const Feedback = require('../models/Feedback');
const { protect, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    if (req.user.role === 'president') {
      const feedbacks = await Feedback.find().populate('submittedBy', 'username').sort({ date: -1 });
      res.json(feedbacks);
    } else {
      const feedbacks = await Feedback.find({
        $or: [{ isAnonymous: false }, { submittedBy: req.user._id }]
      }).populate('submittedBy', 'username').sort({ date: -1 });
      res.json(feedbacks);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, async (req, res) => {
  const { text, category, isAnonymous } = req.body;
  try {
    const feedback = await Feedback.create({
      text, category, isAnonymous, submittedBy: isAnonymous ? undefined : req.user._id
    });
    const populatedFeedback = await feedback.populate('submittedBy', 'username');
    res.status(201).json(populatedFeedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/:id', protect, requireRole(['president']), async (req, res) => {
  const { status, resolutionNotes } = req.body;
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) return res.status(404).json({ message: 'Feedback not found' });

    if (status) feedback.status = status;
    if (resolutionNotes !== undefined) feedback.resolutionNotes = resolutionNotes;

    const updatedFeedback = await feedback.save();
    const populatedFeedback = await updatedFeedback.populate('submittedBy', 'username');
    res.json(populatedFeedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
