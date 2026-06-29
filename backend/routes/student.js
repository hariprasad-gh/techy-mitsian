const express = require('express');
const router = express.Router();
const { getStudents, getStudentById, updateStudentProfile, uploadResume } = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Student profile and list routes
router.get('/', protect, authorize('admin', 'company'), getStudents);
router.put('/profile', protect, authorize('student'), updateStudentProfile);
router.post('/upload-resume', protect, authorize('student'), upload.single('resume'), uploadResume);
router.get('/:id', protect, getStudentById);

module.exports = router;
