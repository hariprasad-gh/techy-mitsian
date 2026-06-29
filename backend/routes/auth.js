const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe } = require('../controllers/authController');
const { getCompanies, updateCompanyProfile } = require('../controllers/companyController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);

// Company routes (frontend points to /api/auth/companies and /api/auth/company-profile)
router.get('/companies', protect, getCompanies);
router.put('/company-profile', protect, authorize('company'), updateCompanyProfile);

module.exports = router;
