const express = require('express');
const router = express.Router();
const { getCompanies, updateCompanyProfile } = require('../controllers/companyController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getCompanies);
router.put('/profile', protect, authorize('company'), updateCompanyProfile);

module.exports = router;
