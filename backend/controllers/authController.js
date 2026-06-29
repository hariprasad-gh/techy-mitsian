const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/Student');
const Company = require('../models/Company');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password, role, ...profileData } = req.body;

  try {
    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Check rollNumber unique for student
    if (role === 'student' && profileData.rollNumber) {
      const rollExists = await Student.findOne({ rollNumber: profileData.rollNumber });
      if (rollExists) {
        return res.status(400).json({ message: 'Roll number already registered' });
      }
    }

    // Create User
    const user = await User.create({
      name,
      email,
      password,
      role
    });

    let profile = null;

    if (role === 'student') {
      profile = await Student.create({
        user: user._id,
        rollNumber: profileData.rollNumber,
        cgpa: profileData.cgpa,
        department: profileData.department,
        batch: profileData.batch
      });
    } else if (role === 'company') {
      profile = await Company.create({
        user: user._id,
        companyName: profileData.companyName,
        website: profileData.website,
        industry: profileData.industry,
        location: profileData.location
      });
    }

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server error during registration' });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error during login' });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let profile = null;
    if (user.role === 'student') {
      profile = await Student.findOne({ user: user._id });
    } else if (user.role === 'company') {
      profile = await Company.findOne({ user: user._id });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profile
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving profile' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe
};
