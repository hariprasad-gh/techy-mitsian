const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load Models
const User = require('./models/User');
const Student = require('./models/Student');
const Company = require('./models/Company');
const Job = require('./models/Job');
const Application = require('./models/Application');

// Load Environment variables
dotenv.config();

const seedData = async () => {
  try {
    // Connect to Database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for Seeding...');

    // Clear existing data
    await User.deleteMany();
    await Student.deleteMany();
    await Company.deleteMany();
    await Job.deleteMany();
    await Application.deleteMany();
    console.log('Cleared existing database entries.');

    // --- CREATE USERS ---

    // 1. Admin
    const adminUser = await User.create({
      name: 'Dr. Hari Prasad (T&P Head)',
      email: 'admin@placement.edu',
      password: 'password123',
      role: 'admin'
    });
    console.log('Admin account created: admin@placement.edu');

    // 2. Google Recruiter
    const googleUser = await User.create({
      name: 'Sundar Pichai (Google HR)',
      email: 'google@gmail.com',
      password: 'password123',
      role: 'company'
    });
    console.log('Google Recruiter user created: google@gmail.com');

    // 3. Microsoft Recruiter
    const microsoftUser = await User.create({
      name: 'Satya Nadella (Microsoft HR)',
      email: 'microsoft@gmail.com',
      password: 'password123',
      role: 'company'
    });
    console.log('Microsoft Recruiter user created: microsoft@gmail.com');

    // 4. Student Candidate
    const studentUser = await User.create({
      name: 'Misha Hariprasad',
      email: 'student@placement.edu',
      password: 'password123',
      role: 'student'
    });
    console.log('Student user created: student@placement.edu');


    // --- CREATE PROFILES ---

    // Google Profile
    const googleProfile = await Company.create({
      user: googleUser._id,
      companyName: 'Google LLC',
      website: 'https://careers.google.com',
      industry: 'Technology',
      location: 'Mountain View, CA & Bangalore, IN',
      description: 'Google LLC is an American multinational technology company specializing in online advertising, search engine technology, cloud computing, computer software, quantum computing, e-commerce, consumer electronics, and artificial intelligence.'
    });
    console.log('Google Company profile created.');

    // Microsoft Profile
    const microsoftProfile = await Company.create({
      user: microsoftUser._id,
      companyName: 'Microsoft Corporation',
      website: 'https://careers.microsoft.com',
      industry: 'Technology',
      location: 'Redmond, WA & Hyderabad, IN',
      description: 'Microsoft Corporation is an American multinational technology corporation headquarted in Redmond, Washington. Microsoft is best known for its software products, including the Windows line of operating systems, the Microsoft 365 suite, and the Edge web browser.'
    });
    console.log('Microsoft Company profile created.');

    // Student Profile
    const studentProfile = await Student.create({
      user: studentUser._id,
      rollNumber: 'MIT2022099',
      cgpa: 8.5,
      department: 'CSE',
      batch: 2026,
      skills: ['React', 'Node.js', 'Express', 'MongoDB', 'Python', 'C++'],
      resumeUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
    });
    console.log('Student Candidate profile created.');


    // --- CREATE JOB OPENINGS ---
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    // Job 1: Google Software Engineer Intern
    const job1 = await Job.create({
      company: googleUser._id,
      companyName: 'Google LLC',
      title: 'Software Engineer Intern (Summer 2026)',
      description: 'Join Google for an immersive internship experience in software development. As an intern, you will work on production software alongside world-class engineers, solving complex scalability and algorithm problems.',
      requirements: 'Currently enrolled in B.Tech/M.Tech program in Computer Science or related fields.\nExperience with one or more general-purpose programming languages including Java, C++, Python, or JavaScript.\nSolid understanding of data structures and algorithms.',
      salary: '18,00,000 INR (Stipend pro-rated)',
      location: 'Bangalore, IN',
      minCGPA: 8.0,
      allowedBranches: ['CSE', 'IT'],
      deadline: nextWeek,
      status: 'active'
    });
    console.log('Google SWE Job created.');

    // Job 2: Microsoft Program Manager
    const job2 = await Job.create({
      company: microsoftUser._id,
      companyName: 'Microsoft Corporation',
      title: 'Program Manager - Azure Cloud Services',
      description: 'We are seeking product-minded engineers to lead roadmap development and feature specifications for new capabilities in Azure Cloud Compute. You will bridge product marketing, user experience design, and backend engineering teams.',
      requirements: 'Pursuing engineering degrees with strong analytical and communication skills.\nFamiliarity with cloud platforms (Azure, AWS, GCP) is a plus.\nStrong leadership capabilities and cross-team collaboration.',
      salary: '22,00,000 INR',
      location: 'Hyderabad, IN',
      minCGPA: 7.5,
      allowedBranches: ['CSE', 'ECE', 'IT'],
      deadline: nextWeek,
      status: 'active'
    });
    console.log('Microsoft PM Job created.');

    // Job 3: Google Silicon Design Engineer (Ineligible for CSE, needs ECE/EEE)
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 2); // Expired deadline

    const job3 = await Job.create({
      company: googleUser._id,
      companyName: 'Google LLC',
      title: 'Hardware & Silicon Design Engineer (Google TPU Team)',
      description: 'Work with the custom silicon architecture group building Tensor Processing Units (TPUs) that power modern AI/ML model training at scale. Focus on RTL design, verification, and logic implementation.',
      requirements: 'Solid knowledge of digital logic, computer architecture, Verilog/SystemVerilog, and VLSI systems.\nExperience with FPGA design prototyping is a plus.',
      salary: '25,00,000 INR',
      location: 'Bangalore, IN',
      minCGPA: 7.0,
      allowedBranches: ['ECE', 'EEE'],
      deadline: nextWeek, // Active drive
      status: 'active'
    });
    console.log('Google TPU Design Job created.');

    // --- CREATE APPLICATIONS ---
    // Make student apply for Google SWE Intern
    await Application.create({
      job: job1._id,
      student: studentUser._id,
      studentProfile: studentProfile._id,
      status: 'applied'
    });
    console.log('Sample Job Application submitted (Student applied to Google SWE Intern).');

    console.log('Database successfully seeded!');
    process.exit();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
