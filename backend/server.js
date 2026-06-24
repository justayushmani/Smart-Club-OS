const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/notices', require('./routes/noticeRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/recruits', require('./routes/recruitRoutes')); // Legacy
app.use('/api/recruitment', require('./routes/recruitment')); // New ATS
app.use('/api/feedback', require('./routes/feedbackRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
