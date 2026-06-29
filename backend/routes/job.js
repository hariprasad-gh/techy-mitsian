const express = require('express');
const router = express.Router();
const { getJobs, getJobById, createJob, updateJob, deleteJob } = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getJobs)
  .post(protect, authorize('company'), createJob);

router.route('/:id')
  .get(protect, getJobById)
  .put(protect, authorize('company'), updateJob)
  .delete(protect, authorize('company', 'admin'), deleteJob);

module.exports = router;
