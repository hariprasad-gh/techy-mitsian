const Company = require('../models/Company');

// @desc    Get all companies
// @route   GET /api/auth/companies
// @access  Private
const getCompanies = async (req, res) => {
  try {
    const companies = await Company.find().populate('user', 'name email');
    res.json(companies);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving companies list' });
  }
};

// @desc    Update company profile
// @route   PUT /api/auth/company-profile
// @access  Private (Company only)
const updateCompanyProfile = async (req, res) => {
  try {
    let company = await Company.findOne({ user: req.user._id });
    if (!company) {
      return res.status(404).json({ message: 'Company profile not found' });
    }

    const { companyName, website, industry, location, description } = req.body;
    company.companyName = companyName || company.companyName;
    company.website = website !== undefined ? website : company.website;
    company.industry = industry || company.industry;
    company.location = location || company.location;
    company.description = description !== undefined ? description : company.description;

    const updated = await company.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating company profile' });
  }
};

module.exports = {
  getCompanies,
  updateCompanyProfile
};
