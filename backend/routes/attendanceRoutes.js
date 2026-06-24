const express = require('express');
const Attendance = require('../models/Attendance');
const { protect, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    const records = await Attendance.find()
      .populate('attendees', 'username role department')
      .populate('recordedBy', 'username role')
      .sort({ date: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, requireRole(['president', 'department_lead']), async (req, res) => {
  const { title, date, format, attendees } = req.body;
  try {
    const record = await Attendance.create({ 
      title, 
      date, 
      format, 
      attendees, 
      recordedBy: req.user._id 
    });
    
    const populatedRecord = await Attendance.findById(record._id)
      .populate('attendees', 'username role department')
      .populate('recordedBy', 'username role');
      
    res.status(201).json(populatedRecord);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', protect, requireRole(['president', 'department_lead']), async (req, res) => {
  try {
    const record = await Attendance.findById(req.params.id);
    if (!record) return res.status(404).json({ message: 'Attendance record not found' });

    await Attendance.findByIdAndDelete(req.params.id);
    res.json({ message: 'Attendance record removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
