const express = require('express');
const Event = require('../models/Event');
const { protect, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    const events = await Event.find().populate('author', 'username role').sort({ date: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, requireRole(['president', 'department_lead']), async (req, res) => {
  const { title, description, date, type } = req.body;
  try {
    const event = await Event.create({ title, description, date, type, author: req.user._id });
    const populatedEvent = await event.populate('author', 'username role');
    res.status(201).json(populatedEvent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', protect, requireRole(['president', 'department_lead']), async (req, res) => {
  try {
    const eventToUpdate = await Event.findById(req.params.id);
    if (!eventToUpdate) return res.status(404).json({ message: 'Event not found' });
    
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('author', 'username role');
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', protect, requireRole(['president', 'department_lead']), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
