const express = require('express');
const Task = require('../models/Task');
const { protect, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    // Only fetch tasks for the user's department, unless they are president
    const filter = req.user.role === 'president' ? {} : { department: req.user.department };
    const tasks = await Task.find(filter).populate('assignee', 'username').sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, requireRole(['president', 'department_lead']), async (req, res) => {
  const { title, department, description, assignee, deadline } = req.body;
  try {
    if (req.user.role === 'department_lead' && department !== req.user.department) {
      return res.status(403).json({ message: 'Department Leads can only assign tasks to their own department' });
    }
    const task = await Task.create({ title, department, description, assignee, deadline });
    const populatedTask = await task.populate('assignee', 'username');
    res.status(201).json(populatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/:id', protect, async (req, res) => {
  const { stage } = req.body;
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (req.user.role === 'member') {
      if (task.department !== req.user.department) {
        return res.status(403).json({ message: 'Cannot update other department tasks' });
      }
      if (stage === 'done') {
        return res.status(403).json({ message: 'Members cannot mark tasks as Done without approval' });
      }
    } else if (req.user.role === 'department_lead') {
      if (task.department !== req.user.department) {
        return res.status(403).json({ message: 'Cannot update tasks outside your department' });
      }
    }

    task.stage = stage;
    const updatedTask = await task.save();
    const populatedTask = await updatedTask.populate('assignee', 'username');
    res.json(populatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
