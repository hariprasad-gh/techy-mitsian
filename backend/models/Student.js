const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  rollNumber: {
    type: String,
    required: [true, 'Please add a roll number'],
    unique: true
  },
  cgpa: {
    type: Number,
    required: [true, 'Please add CGPA'],
    min: [0, 'CGPA cannot be negative'],
    max: [10, 'CGPA cannot exceed 10']
  },
  department: {
    type: String,
    required: [true, 'Please add a department/branch'],
    enum: ['CSE', 'ECE', 'EEE', 'ME', 'CE', 'IT']
  },
  batch: {
    type: Number,
    required: [true, 'Please add graduation batch year']
  },
  skills: {
    type: [String],
    default: []
  },
  resumeUrl: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Student', StudentSchema);
