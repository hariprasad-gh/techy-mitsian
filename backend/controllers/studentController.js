const Student = require('../models/Student');
const User = require('../models/User');

// @desc    Get all students
// @route   GET /api/students
// @access  Private (Admin, Company)
const getStudents = async (req, res) => {
  try {
    const students = await Student.find().populate('user', 'name email');
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving students list' });
  }
};

// @desc    Get student by ID
// @route   GET /api/students/:id
// @access  Private
const getStudentById = async (req, res) => {
  try {
    let student = await Student.findById(req.params.id).populate('user', 'name email');
    if (!student) {
      student = await Student.findOne({ user: req.params.id }).populate('user', 'name email');
    }
    
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving student details' });
  }
};

// @desc    Update student profile
// @route   PUT /api/students/profile
// @access  Private (Student only)
const updateStudentProfile = async (req, res) => {
  try {
    let student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const { rollNumber, cgpa, department, batch, resumeUrl, skills } = req.body;
    student.rollNumber = rollNumber || student.rollNumber;
    student.cgpa = cgpa !== undefined ? cgpa : student.cgpa;
    student.department = department || student.department;
    student.batch = batch || student.batch;
    student.resumeUrl = resumeUrl !== undefined ? resumeUrl : student.resumeUrl;
    student.skills = skills !== undefined ? skills : student.skills;

    const updated = await student.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating student profile' });
  }
};

// @desc    Upload student resume PDF
// @route   POST /api/students/upload-resume
// @access  Private (Student only)
const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a PDF file' });
    }
    
    // Construct public resume URL
    const resumeUrl = `${req.protocol}://${req.get('host')}/uploads/resumes/${req.file.filename}`;
    
    const student = await Student.findOne({ user: req.user._id });
    if (student) {
      student.resumeUrl = resumeUrl;
      await student.save();
    }

    res.json({
      message: 'Resume uploaded successfully',
      resumeUrl
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error uploading resume' });
  }
};

module.exports = {
  getStudents,
  getStudentById,
  updateStudentProfile,
  uploadResume
};
