const express = require('express');
const Notice = require('../models/Notice');
const { protect, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    const notices = await Notice.find().populate('author', 'username role').sort({ date: -1 });
    res.json(notices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, requireRole(['president', 'department_lead']), async (req, res) => {
  const { title, category, content } = req.body;
  try {
    if (req.user.role === 'department_lead' && category !== req.user.department) {
      return res.status(403).json({ message: 'Department Leads can only post for their own department category' });
    }
    const notice = await Notice.create({ title, category, content, author: req.user._id });
    const populatedNotice = await notice.populate('author', 'username role');
    res.status(201).json(populatedNotice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', protect, requireRole(['president', 'department_lead']), async (req, res) => {
  try {
    const noticeToUpdate = await Notice.findById(req.params.id);
    if (!noticeToUpdate) return res.status(404).json({ message: 'Notice not found' });
    
    if (req.user.role === 'department_lead' && noticeToUpdate.category !== req.user.department) {
      return res.status(403).json({ message: 'Cannot edit notices outside your department' });
    }

    const notice = await Notice.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('author', 'username role');
    res.json(notice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', protect, requireRole(['president', 'department_lead']), async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) return res.status(404).json({ message: 'Notice not found' });

    if (req.user.role === 'department_lead' && notice.category !== req.user.department) {
      return res.status(403).json({ message: 'Cannot delete notices outside your department' });
    }

    await Notice.findByIdAndDelete(req.params.id);
    res.json({ message: 'Notice removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
