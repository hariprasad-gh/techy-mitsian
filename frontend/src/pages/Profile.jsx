import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Profile = () => {
  const { user, updateUserProfile } = useContext(AuthContext);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // Student specific profile state
  const [rollNumber, setRollNumber] = useState('');
  const [cgpa, setCgpa] = useState('');
  const [department, setDepartment] = useState('CSE');
  const [batch, setBatch] = useState('');
  const [skills, setSkills] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');

  // Company specific profile state
  const [companyName, setCompanyName] = useState('');
  const [website, setWebsite] = useState('');
  const [industry, setIndustry] = useState('Technology');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      
      if (user.role === 'student' && user.profile) {
        setRollNumber(user.profile.rollNumber || '');
        setCgpa(user.profile.cgpa || '');
        setDepartment(user.profile.department || 'CSE');
        setBatch(user.profile.batch || '');
        setSkills(user.profile.skills ? user.profile.skills.join(', ') : '');
        setResumeUrl(user.profile.resumeUrl || '');
      } else if (user.role === 'company' && user.profile) {
        setCompanyName(user.profile.companyName || '');
        setWebsite(user.profile.website || '');
        setIndustry(user.profile.industry || 'Technology');
        setLocation(user.profile.location || '');
        setDescription(user.profile.description || '');
      }
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      if (user.role === 'student') {
        const skillsArray = skills.split(',').map(s => s.trim()).filter(Boolean);
        await updateUserProfile({
          rollNumber,
          cgpa: parseFloat(cgpa),
          department,
          batch,
          resumeUrl,
          skills: skillsArray
        });
      } else if (user.role === 'company') {
        await updateUserProfile({
          companyName,
          website,
          industry,
          location,
          description
        });
      }
      setMessage('Profile settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update profile details.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <p>Loading user profile...</p>;

  return (
    <div style={{ maxWidth: '750px', margin: '0 auto' }} className="animate-fade-in">
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>My Account Settings</h1>
          <p>Manage your login credentials, role configurations, and resume information</p>
        </div>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card">
        <form onSubmit={handleSubmit}>
          
          <h2 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            Basic Profile Details
          </h2>
          
          <div className="form-row">
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" className="form-control" value={name} disabled style={{ opacity: 0.6 }} />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" className="form-control" value={email} disabled style={{ opacity: 0.6 }} />
            </div>
          </div>
          
          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label>System Access Role</label>
            <span className="badge badge-shortlisted" style={{ width: 'fit-content', padding: '0.4rem 1rem' }}>
              ⚙️ {user.role.toUpperCase()} ACCOUNT
            </span>
          </div>

          {/* Student Profile Sections */}
          {user.role === 'student' && (
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                Academic Credentials
              </h2>

              <div className="form-row">
                <div className="form-group">
                  <label>Roll Number</label>
                  <input
                    type="text"
                    className="form-control"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>CGPA</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    value={cgpa}
                    onChange={(e) => setCgpa(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Department / Branch</label>
                  <select
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
                  <label>Graduation Batch (Year)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={batch}
                    onChange={(e) => setBatch(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Technical Skills (comma separated)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. React, Node.js, SQL, Java"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Resume Public URL</label>
                <input
                  type="url"
                  className="form-control"
                  placeholder="https://drive.google.com/file/d/..."
                  value={resumeUrl}
                  onChange={(e) => setResumeUrl(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          {/* Company Profile Sections */}
          {user.role === 'company' && (
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                Corporate Details
              </h2>

              <div className="form-row">
                <div className="form-group">
                  <label>Company Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Corporate Website</label>
                  <input
                    type="url"
                    className="form-control"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Industry</label>
                  <select
                    className="form-control"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                  >
                    <option value="Technology">Technology & Software</option>
                    <option value="Finance">Finance & Banking</option>
                    <option value="Consulting">Consulting</option>
                    <option value="Automotive">Automotive & Engineering</option>
                    <option value="Healthcare">Healthcare & Biotech</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>HQ Location</label>
                  <input
                    type="text"
                    className="form-control"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Company Brief Description</label>
                <textarea
                  rows="4"
                  className="form-control"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your company and culture..."
                ></textarea>
              </div>
            </div>
          )}

          {user.role !== 'admin' && (
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '1rem' }}>
              {loading ? 'Saving Settings...' : 'Save Profile Settings'}
            </button>
          )}

        </form>
      </div>
    </div>
  );
};

export default Profile;
