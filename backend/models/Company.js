const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  companyName: {
    type: String,
    required: [true, 'Please add a company name']
  },
  website: {
    type: String,
    default: ''
  },
  industry: {
    type: String,
    default: 'Technology'
  },
  location: {
    type: String,
    required: [true, 'Please add company location']
  },
  description: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Company', CompanySchema);
