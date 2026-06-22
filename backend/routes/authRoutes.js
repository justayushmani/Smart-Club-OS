const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', { expiresIn: '30d' });
};

router.post('/register', async (req, res) => {
  const { username, email, password, role, department } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({ username, email, password, role, department });
    res.status(201).json({
      _id: user._id, username: user.username, email: user.email, role: user.role, department: user.department,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id, username: user.username, email: user.email, role: user.role, department: user.department,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const { protect, requireRole } = require('../middleware/auth');

router.get('/members', protect, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/members/:id', protect, requireRole(['president']), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/simulate', async (req, res) => {
  const { profile } = req.body;
  let simulatedData = {};
  if (profile === 'president') {
    simulatedData = { _id: '60d5ec9af682fbd39a1b8b9a', username: 'John', role: 'president', department: 'common', isSimulated: true };
  } else if (profile === 'lead') {
    simulatedData = { _id: '60d5ec9af682fbd39a1b8b9b', username: 'Sarah', role: 'department_lead', department: 'tech', isSimulated: true };
  } else if (profile === 'member') {
    simulatedData = { _id: '60d5ec9af682fbd39a1b8b9c', username: 'Alex', role: 'member', department: 'tech', isSimulated: true };
  }
  
  const token = jwt.sign(simulatedData, process.env.JWT_SECRET || 'secret123', { expiresIn: '30d' });
  res.json({ ...simulatedData, token });
});

module.exports = router;
