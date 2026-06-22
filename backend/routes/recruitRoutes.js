const express = require('express');
const Candidate = require('../models/Candidate');
const { protect, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, requireRole(['president', 'department_lead']), async (req, res) => {
  try {
    const filter = req.user.role === 'president' ? {} : { domain: req.user.department };
    const candidates = await Candidate.find(filter).sort({ createdAt: -1 });
    res.json(candidates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  const { name, email, domain, cgpa } = req.body;
  try {
    const candidate = await Candidate.create({ name, email, domain, cgpa });
    res.status(201).json(candidate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/:id', protect, requireRole(['president', 'department_lead']), async (req, res) => {
  const { stage, testScore, interviewNotes } = req.body;
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) return res.status(404).json({ message: 'Candidate not found' });
    
    if (req.user.role === 'department_lead') {
      if (candidate.domain !== req.user.department) {
        return res.status(403).json({ message: 'Cannot edit candidate from another domain' });
      }
      if (stage === 'selected') {
        return res.status(403).json({ message: 'Only President can move candidates to Selected stage' });
      }
    }

    if (stage) candidate.stage = stage;
    if (testScore !== undefined) candidate.testScore = testScore;
    if (interviewNotes) candidate.interviewNotes = interviewNotes;

    const updatedCandidate = await candidate.save();
    res.json(updatedCandidate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
