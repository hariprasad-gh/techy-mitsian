const express = require('express');
const router = express.Router();
const { applyForJob, getMyApplications, getJobApplications, updateApplicationStatus } = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/apply/:jobId', protect, authorize('student'), applyForJob);
router.get('/my', protect, authorize('student'), getMyApplications);
router.get('/job/:jobId', protect, authorize('company', 'admin'), getJobApplications);
router.put('/:applicationId/status', protect, authorize('company', 'admin'), updateApplicationStatus);

module.exports = router;
