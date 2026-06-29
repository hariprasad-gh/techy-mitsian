import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
  const { registerUser, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Student specific fields
  const [rollNumber, setRollNumber] = useState('');
  const [cgpa, setCgpa] = useState('');
  const [department, setDepartment] = useState('CSE');
  const [batch, setBatch] = useState(new Date().getFullYear().toString());

  // Company specific fields
  const [companyName, setCompanyName] = useState('');
  const [website, setWebsite] = useState('');
  const [industry, setIndustry] = useState('Technology');
  const [location, setLocation] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'company') navigate('/company');
      else navigate('/student');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFormLoading(true);

    const payload = {
      name,
      email,
      password,
      role
    };

    if (role === 'student') {
      payload.rollNumber = rollNumber;
      payload.cgpa = parseFloat(cgpa);
      payload.department = department;
      payload.batch = batch;

      if (isNaN(payload.cgpa) || payload.cgpa < 0 || payload.cgpa > 10) {
        setError('Please enter a valid CGPA between 0 and 10');
        setFormLoading(false);
        return;
      }
    } else if (role === 'company') {
      payload.companyName = companyName;
      payload.website = website;
      payload.industry = industry;
      payload.location = location;
    }

    try {
      await registerUser(payload);
    } catch (err) {
      setError(err.message || 'Registration failed');
      setFormLoading(false);
    }
  };

  return (
    <div className="auth-page" style={{ minHeight: 'calc(100vh - 120px)' }}>
      <div className="auth-card" style={{ maxWidth: '550px' }}>
        <div className="auth-header">
          <h2>Create Account</h2>
          <p>Join the TechyPlacement campus network</p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                className="form-control"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="role">I am registering as a</label>
              <select
                id="role"
                className="form-control"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              >
                <option value="student">Student / Candidate</option>
                <option value="company">Employer / Recruiter</option>
                <option value="admin">Drive Coordinator / Admin</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                className="form-control"
                placeholder="name@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                className="form-control"
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Conditional Student Fields */}
          {role === 'student' && (
            <fieldset style={{ border: 'none', margin: '1rem 0', padding: '1rem', background: 'rgba(255,255,255,0.01)', borderRadius: '10px', borderLeft: '3px solid var(--accent-purple)' }}>
              <legend style={{ fontSize: '0.85rem', fontWeight: '700', padding: '0 0.5rem', color: 'var(--accent-purple)', textTransform: 'uppercase' }}>Academic Credentials</legend>
              
              <div className="form-row" style={{ marginTop: '0.5rem' }}>
                <div className="form-group">
                  <label htmlFor="rollNumber">Roll / Register Number</label>
                  <input
                    type="text"
                    id="rollNumber"
                    className="form-control"
                    placeholder="e.g. 20CSE101"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="cgpa">Current Cumulative CGPA</label>
                  <input
                    type="number"
                    step="0.01"
                    id="cgpa"
                    className="form-control"
                    placeholder="e.g. 8.45"
                    value={cgpa}
                    onChange={(e) => setCgpa(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="department">Department / Branch</label>
                  <select
                    id="department"
                    className="form-control"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    required
                  >
                    <option value="CSE">Computer Science & Eng (CSE)</option>
                    <option value="ECE">Electronics & Comm Eng (ECE)</option>
                    <option value="EEE">Electrical & Electronics Eng (EEE)</option>
                    <option value="ME">Mechanical Eng (ME)</option>
                    <option value="CE">Civil Eng (CE)</option>
                    <option value="IT">Information Technology (IT)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="batch">Graduation Year (Batch)</label>
                  <input
                    type="number"
                    id="batch"
                    className="form-control"
                    value={batch}
                    onChange={(e) => setBatch(e.target.value)}
                    required
                  />
                </div>
              </div>
            </fieldset>
          )}

          {/* Conditional Company Fields */}
          {role === 'company' && (
            <fieldset style={{ border: 'none', margin: '1rem 0', padding: '1rem', background: 'rgba(255,255,255,0.01)', borderRadius: '10px', borderLeft: '3px solid var(--accent-blue)' }}>
              <legend style={{ fontSize: '0.85rem', fontWeight: '700', padding: '0 0.5rem', color: 'var(--accent-blue)', textTransform: 'uppercase' }}>Employer Details</legend>
              
              <div className="form-row" style={{ marginTop: '0.5rem' }}>
                <div className="form-group">
                  <label htmlFor="companyName">Company / Organization Name</label>
                  <input
                    type="text"
                    id="companyName"
                    className="form-control"
                    placeholder="e.g. Acme Corp"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="website">Company Website</label>
                  <input
                    type="url"
                    id="website"
                    className="form-control"
                    placeholder="e.g. https://acme.com"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="industry">Industry Sector</label>
                  <select
                    id="industry"
                    className="form-control"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                  >
                    <option value="Technology">Technology & Software</option>
                    <option value="Finance">Finance & Banking</option>
                    <option value="Consulting">Management Consulting</option>
                    <option value="Automotive">Automotive & Core Eng</option>
                    <option value="Healthcare">Healthcare & Biotech</option>
                    <option value="EdTech">EdTech & Education</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="location">Headquarters Location</label>
                  <input
                    type="text"
                    id="location"
                    className="form-control"
                    placeholder="e.g. Bangalore, KA"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                  />
                </div>
              </div>
            </fieldset>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={formLoading}
            style={{ marginTop: '1rem' }}
          >
            {formLoading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div className="auth-footer">
          Already registered? <Link to="/login">Sign In here</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
