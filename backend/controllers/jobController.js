const Job = require('../models/Job');
const Company = require('../models/Company');

// @desc    Get all jobs (or company specific)
// @route   GET /api/jobs
// @access  Private
const getJobs = async (req, res) => {
  try {
    const { companyOnly } = req.query;
    let query = {};
    if (companyOnly === 'true') {
      query.company = req.user._id;
    }
    const jobs = await Job.find(query).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving jobs' });
  }
};

// @desc    Get job by ID
// @route   GET /api/jobs/:id
// @access  Private
const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job posting not found' });
    }
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving job details' });
  }
};

// @desc    Create a job posting
// @route   POST /api/jobs
// @access  Private (Company only)
const createJob = async (req, res) => {
  const { title, description, requirements, salary, location, minCGPA, allowedBranches, deadline } = req.body;

  try {
    const companyProfile = await Company.findOne({ user: req.user._id });
    if (!companyProfile) {
      return res.status(400).json({ message: 'Company profile required to post a job' });
    }

    const job = await Job.create({
      company: req.user._id,
      companyName: companyProfile.companyName,
      title,
      description,
      requirements,
      salary,
      location,
      minCGPA: minCGPA || 6.0,
      allowedBranches: allowedBranches || [],
      deadline,
      status: 'active'
    });

    res.status(201).json(job);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server error creating job posting' });
  }
};

// @desc    Update a job posting
// @route   PUT /api/jobs/:id
// @access  Private (Company only)
const updateJob = async (req, res) => {
  try {
    let job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job posting not found' });
    }

    // Make sure user is owner of the job
    if (job.company.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this job posting' });
    }

    const { title, description, requirements, salary, location, minCGPA, allowedBranches, deadline, status } = req.body;
    job.title = title || job.title;
    job.description = description || job.description;
    job.requirements = requirements || job.requirements;
    job.salary = salary || job.salary;
    job.location = location || job.location;
    job.minCGPA = minCGPA !== undefined ? minCGPA : job.minCGPA;
    job.allowedBranches = allowedBranches || job.allowedBranches;
    job.deadline = deadline || job.deadline;
    job.status = status || job.status;

    const updated = await job.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating job posting' });
  }
};

// @desc    Delete a job posting
// @route   DELETE /api/jobs/:id
// @access  Private (Company or Admin)
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job posting not found' });
    }

    // Authorized check: company who posted it or admin
    if (job.company.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this job posting' });
    }

    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: 'Job posting deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting job posting' });
  }
};

module.exports = {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob
};
