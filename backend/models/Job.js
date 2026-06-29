const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  companyName: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add a job title']
  },
  description: {
    type: String,
    required: [true, 'Please add a job description']
  },
  requirements: {
    type: String,
    required: [true, 'Please add requirements']
  },
  salary: {
    type: String,
    required: [true, 'Please add CTC package details']
  },
  location: {
    type: String,
    required: [true, 'Please add job location']
  },
  minCGPA: {
    type: Number,
    required: [true, 'Please add minimum CGPA required'],
    default: 6.0
  },
  allowedBranches: {
    type: [String],
    default: ['CSE', 'ECE', 'IT']
  },
  deadline: {
    type: Date,
    required: [true, 'Please add application deadline']
  },
  status: {
    type: String,
    enum: ['active', 'closed'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Job', JobSchema);
