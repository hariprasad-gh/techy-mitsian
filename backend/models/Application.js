const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studentProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  status: {
    type: String,
    enum: ['applied', 'shortlisted', 'rejected', 'selected'],
    default: 'applied'
  },
  appliedAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure unique application per candidate per job drive
ApplicationSchema.index({ job: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('Application', ApplicationSchema);
