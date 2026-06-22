const express = require('express');
const router = express.Router();
const RecruitmentForm = require('../models/RecruitmentForm');
const CandidateApplication = require('../models/CandidateApplication');
const { protect, requireRole } = require('../middleware/auth');

// POST /api/recruitment/form - President Only
router.post('/form', protect, requireRole(['president']), async (req, res) => {
  try {
    const { questions } = req.body;
    
    // Deactivate previous forms
    await RecruitmentForm.updateMany({}, { isActive: false });
    
    const newForm = await RecruitmentForm.create({
      createdBy: req.user._id,
      isActive: true,
      questions
    });
    
    res.status(201).json(newForm);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/recruitment/form/public - Public
router.get('/form/public', async (req, res) => {
  try {
    const activeForm = await RecruitmentForm.findOne({ isActive: true });
    if (!activeForm) {
      return res.status(404).json({ message: 'No active recruitment form found' });
    }
    res.json(activeForm);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/recruitment/apply - Public
router.post('/apply', async (req, res) => {
  try {
    const { name, email, department, cgpa, answers } = req.body;
    
    // Check if email already applied
    const existing = await CandidateApplication.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'You have already applied.' });
    }

    const application = await CandidateApplication.create({
      name, email, department, cgpa, answers
    });
    
    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/recruitment/candidates - President & Leads Only
router.get('/candidates', protect, requireRole(['president', 'department_lead']), async (req, res) => {
  try {
    const filter = req.user.role === 'president' ? {} : { department: req.user.department };
    const candidates = await CandidateApplication.find(filter).sort({ dateSubmitted: -1 });
    res.json(candidates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/recruitment/candidates/:id/evaluate - President & Leads Only
router.post('/candidates/:id/evaluate', protect, requireRole(['president', 'department_lead']), async (req, res) => {
  try {
    const { score, comments } = req.body;
    const candidate = await CandidateApplication.findById(req.params.id);
    
    if (!candidate) return res.status(404).json({ message: 'Candidate not found' });

    if (req.user.role === 'department_lead' && candidate.department !== req.user.department) {
      return res.status(403).json({ message: 'Cannot evaluate candidates outside your department' });
    }

    candidate.evaluations.push({
      reviewer: req.user._id,
      reviewerName: req.user.username,
      score,
      comments
    });
    
    const updated = await candidate.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/recruitment/candidates/:id/stage - President & Leads Only
router.patch('/candidates/:id/stage', protect, requireRole(['president', 'department_lead']), async (req, res) => {
  try {
    const { stage } = req.body;
    const candidate = await CandidateApplication.findById(req.params.id);
    
    if (!candidate) return res.status(404).json({ message: 'Candidate not found' });

    if (req.user.role === 'department_lead') {
      if (candidate.department !== req.user.department) {
        return res.status(403).json({ message: 'Cannot change stage of candidates outside your department' });
      }
      if (stage === 'Selected') {
        return res.status(403).json({ message: 'Only President can move candidates to Selected stage' });
      }
    }

    candidate.stage = stage;
    const updated = await candidate.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/recruitment/candidates/:id/schedule - President & Leads Only
router.post('/candidates/:id/schedule', protect, requireRole(['president', 'department_lead']), async (req, res) => {
  try {
    const { date, mode, linkOrLocation } = req.body;
    const candidate = await CandidateApplication.findById(req.params.id);
    
    if (!candidate) return res.status(404).json({ message: 'Candidate not found' });

    if (req.user.role === 'department_lead' && candidate.department !== req.user.department) {
      return res.status(403).json({ message: 'Cannot schedule candidates outside your department' });
    }

    candidate.interviewSchedule = { date, mode, linkOrLocation };
    candidate.stage = 'Interview'; // Auto move to interview stage
    const updated = await candidate.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
