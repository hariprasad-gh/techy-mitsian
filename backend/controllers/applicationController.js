const Application = require('../models/Application');
const Job = require('../models/Job');
const Student = require('../models/Student');

// @desc    Apply for a job
// @route   POST /api/applications/apply/:jobId
// @access  Private (Student only)
const applyForJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job posting not found' });
    }

    if (job.status === 'closed' || new Date() > new Date(job.deadline)) {
      return res.status(400).json({ message: 'Application deadline has passed or drive is closed' });
    }

    const studentProfile = await Student.findOne({ user: req.user._id });
    if (!studentProfile) {
      return res.status(400).json({ message: 'Please complete your student profile before applying' });
    }

    // Check if student has already applied
    const alreadyApplied = await Application.findOne({
      job: job._id,
      student: req.user._id
    });
    if (alreadyApplied) {
      return res.status(400).json({ message: 'You have already applied for this job drive' });
    }

    // Check eligibility on backend
    if (studentProfile.cgpa < job.minCGPA) {
      return res.status(400).json({
        message: `Ineligible: Your CGPA (${studentProfile.cgpa}) is lower than the minimum required CGPA of ${job.minCGPA}`
      });
    }

    if (job.allowedBranches && job.allowedBranches.length > 0 && studentProfile.department) {
      const isBranchAllowed = job.allowedBranches.some(
        branch => branch.toLowerCase() === studentProfile.department.toLowerCase()
      );
      if (!isBranchAllowed) {
        return res.status(400).json({
          message: `Ineligible: Your department (${studentProfile.department}) is not allowed to apply for this role`
        });
      }
    }

    const application = await Application.create({
      job: job._id,
      student: req.user._id,
      studentProfile: studentProfile._id,
      status: 'applied'
    });

    res.status(201).json(application);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server error submitting application' });
  }
};

// @desc    Get current student's applications
// @route   GET /api/applications/my
// @access  Private (Student only)
const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ student: req.user._id })
      .populate({
        path: 'job',
        select: 'title companyName salary location deadline status'
      })
      .sort({ appliedAt: -1 });
    
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving applications' });
  }
};

// @desc    Get applications for a job drive
// @route   GET /api/applications/job/:jobId
// @access  Private (Company, Admin)
const getJobApplications = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job drive not found' });
    }

    // Authorize: Only the company that posted it or an admin
    if (job.company.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view applicants for this job' });
    }

    const applications = await Application.find({ job: req.params.jobId })
      .populate('student', 'name email')
      .populate('studentProfile')
      .sort({ appliedAt: -1 });

    // Map to structure matching frontend expects
    const formatted = applications.map(app => {
      const doc = app.toObject();
      return {
        ...doc,
        resumeUrl: doc.studentProfile ? doc.studentProfile.resumeUrl : ''
      };
    });

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving applicants' });
  }
};

// @desc    Update application status
// @route   PUT /api/applications/:applicationId/status
// @access  Private (Company, Admin)
const updateApplicationStatus = async (req, res) => {
  const { status } = req.body;
  if (!['applied', 'shortlisted', 'rejected', 'selected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status update option' });
  }

  try {
    const application = await Application.findById(req.params.applicationId).populate('job');
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Authorize: Only company that posted or admin
    if (application.job.company.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update status' });
    }

    application.status = status;
    const updated = await application.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating status' });
  }
};

module.exports = {
  applyForJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus
};
