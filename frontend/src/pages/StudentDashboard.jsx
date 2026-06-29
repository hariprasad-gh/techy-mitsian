import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getJobs } from '../services/jobsAPI';
import { getMyApplications } from '../services/applicationAPI';
import JobCard from '../components/JobCard';

const StudentDashboard = () => {
  const { user, token, updateUserProfile } = useContext(AuthContext);
  
  const [jobs, setJobs] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [error, setError] = useState('');
  
  // Profile editing state
  const [resumeUrl, setResumeUrl] = useState('');
  const [skills, setSkills] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [cgpa, setCgpa] = useState('');
  const [department, setDepartment] = useState('');
  const [batch, setBatch] = useState('');
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');
  const [updateError, setUpdateError] = useState('');

  // Load profile values on user change
  useEffect(() => {
    if (user && user.profile) {
      setResumeUrl(user.profile.resumeUrl || '');
      setSkills(user.profile.skills ? user.profile.skills.join(', ') : '');
      setRollNumber(user.profile.rollNumber || '');
      setCgpa(user.profile.cgpa || '');
      setDepartment(user.profile.department || '');
      setBatch(user.profile.batch || '');
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!token) return;
    try {
      setLoadingDashboard(true);
      const allJobs = await getJobs(token);
      const apps = await getMyApplications(token);
      setJobs(allJobs);
      setMyApplications(apps);
    } catch (err) {
      setError('Failed to fetch dashboard data. Please try again.');
      console.error(err);
    } finally {
      setLoadingDashboard(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [token]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setUpdateMessage('');
    setUpdateError('');

    try {
      const skillsArray = skills.split(',').map(s => s.trim()).filter(Boolean);
      await updateUserProfile({
        rollNumber,
        cgpa: parseFloat(cgpa),
        department,
        batch,
        resumeUrl,
        skills: skillsArray
      });
      setUpdateMessage('Profile updated successfully!');
      setTimeout(() => setUpdateMessage(''), 3000);
      setShowProfileEdit(false);
      // Reload dashboard data in case eligibility state changed
      loadDashboardData();
    } catch (err) {
      setUpdateError(err.message || 'Failed to update profile.');
    }
  };

  if (loadingDashboard) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
        <p>Loading your dashboard details...</p>
      </div>
    );
  }

  // Filter jobs based on student eligibility criteria
  const getEligibleJobs = () => {
    if (!user || !user.profile) return [];
    const studentCGPA = user.profile.cgpa || 0;
    const studentDept = user.profile.department || '';

    return jobs.filter(job => {
      // Exclude closed jobs
      if (job.status === 'closed' || new Date() > new Date(job.deadline)) return false;
      // Exclude already applied jobs
      if (myApplications.some(app => app.job && app.job._id === job._id)) return false;

      // CGPA cut-off check
      if (studentCGPA < job.minCGPA) return false;

      // Allowed branch/dept check
      if (job.allowedBranches && job.allowedBranches.length > 0) {
        return job.allowedBranches.some(b => b.toLowerCase() === studentDept.toLowerCase());
      }

      return true;
    });
  };

  const eligibleJobs = getEligibleJobs();
  const shortlistCount = myApplications.filter(a => a.status === 'shortlisted').length;
  const selectCount = myApplications.filter(a => a.status === 'selected').length;
  const isProfileIncomplete = !user.profile || !user.profile.resumeUrl || user.profile.cgpa === 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header */}
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>Welcome, {user.name}</h1>
          <p>Explore matching opportunities and track your active drive applications</p>
        </div>
        <div>
          <button 
            onClick={() => setShowProfileEdit(!showProfileEdit)} 
            className="btn btn-primary"
          >
            {showProfileEdit ? 'Cancel Editing' : '✏️ Edit Profile'}
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Profile Incomplete Warning Banner */}
      {isProfileIncomplete && (
        <div className="alert alert-danger" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <strong>⚠️ Incomplete Placement Profile!</strong> You must enter your academic credentials and provide a working Resume Link (Google Drive/Dropbox link) to qualify for applications.
          </div>
          <button onClick={() => setShowProfileEdit(true)} className="btn btn-secondary btn-sm" style={{ color: '#ef4444' }}>
            Complete Now
          </button>
        </div>
      )}

      {/* User Info & Stats Summary cards */}
      <div className="stats-bar">
        <div className="stat-card">
          <span className="stat-label">Applications Submitted</span>
          <span className="stat-value">{myApplications.length}</span>
        </div>
        <div className="stat-card" style={{ borderLeft: '3px solid var(--accent-blue)' }}>
          <span className="stat-label">Shortlisted Roles</span>
          <span className="stat-value" style={{ color: 'var(--color-shortlisted)' }}>{shortlistCount}</span>
        </div>
        <div className="stat-card" style={{ borderLeft: '3px solid var(--color-selected)' }}>
          <span className="stat-label">Selections (Offers)</span>
          <span className="stat-value" style={{ color: 'var(--color-selected)' }}>{selectCount}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Matching Open Jobs</span>
          <span className="stat-value">{eligibleJobs.length}</span>
        </div>
      </div>

      {/* Split Profile Update / Main Panel Grid */}
      <div className="dashboard-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Main profile update form when toggle clicked */}
          {showProfileEdit && (
            <div className="card">
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '1.5rem' }}>Update Academic Profile</h2>
              {updateError && <div className="alert alert-danger">{updateError}</div>}
              {updateMessage && <div className="alert alert-success">{updateMessage}</div>}
              
              <form onSubmit={handleProfileUpdate}>
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
                    <label>Current CGPA</label>
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
                  <label>Skills (comma separated)</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="React, Node.js, Python, SQL" 
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Resume Link (Google Drive / Public Document Link)</label>
                  <input 
                    type="url" 
                    className="form-control" 
                    placeholder="https://drive.google.com/file/d/..." 
                    value={resumeUrl}
                    onChange={(e) => setResumeUrl(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button type="submit" className="btn btn-primary">Save Changes</button>
                  <button type="button" onClick={() => setShowProfileEdit(false)} className="btn btn-secondary">Cancel</button>
                </div>
              </form>
            </div>
          )}

          {/* Matches Opportunities */}
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              🎯 Recommended Jobs for You 
              <span className="badge badge-selected" style={{ fontSize: '0.7rem' }}>Matching Eligibility</span>
            </h2>
            
            {eligibleJobs.length > 0 ? (
              <div className="grid">
                {eligibleJobs.map(job => (
                  <JobCard key={job._id} job={job} />
                ))}
              </div>
            ) : (
              <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                No active matching job openings right now. Check back later or update your profile to expand eligibility criteria!
              </div>
            )}
          </div>

          {/* Active Job Applications list */}
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '1rem' }}>📋 Active Job Applications</h2>
            {myApplications.length > 0 ? (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Job Role</th>
                      <th>Company</th>
                      <th>CTC Package</th>
                      <th>Date Applied</th>
                      <th>Status Badge</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myApplications.map(app => {
                      if (!app.job) return null;
                      return (
                        <tr key={app._id}>
                          <td style={{ fontWeight: '600' }}>{app.job.title}</td>
                          <td>{app.job.companyName}</td>
                          <td><span className="badge badge-applied">{app.job.salary}</span></td>
                          <td>{new Date(app.appliedAt).toLocaleDateString()}</td>
                          <td>
                            <span className={`badge badge-${app.status}`}>
                              {app.status}
                            </span>
                          </td>
                          <td>
                            <Link to={`/jobs/${app.job._id}`} className="btn btn-secondary btn-sm">
                              View Drive
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                You haven't submitted any job applications yet. Go to <Link to="/jobs" style={{ color: 'var(--accent-blue)', fontWeight: '600' }}>Jobs</Link> page to search and apply.
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              Profile Overview
            </h3>
            
            {user.profile ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Roll Number: </span>
                  <span style={{ fontWeight: '600' }}>{user.profile.rollNumber}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Branch: </span>
                  <span style={{ fontWeight: '600' }}>{user.profile.department}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>CGPA: </span>
                  <span style={{ fontWeight: '600' }}>⭐ {user.profile.cgpa}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Batch: </span>
                  <span style={{ fontWeight: '600' }}>{user.profile.batch}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Resume Link: </span>
                  {user.profile.resumeUrl ? (
                    <a href={user.profile.resumeUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-blue)', textDecoration: 'underline', wordBreak: 'break-all' }}>
                      Open Resume ↗
                    </a>
                  ) : (
                    <span style={{ color: 'var(--color-rejected)', fontWeight: '600' }}>Not Uploaded</span>
                  )}
                </div>
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Please enter academic details to setup profile.</p>
            )}
          </div>

          <div className="card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              T&P Support
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
              Need assistance with updates, correction of CGPA, or rescheduling drive rounds?
            </p>
            <p style={{ fontSize: '0.85rem', fontWeight: '600' }}>📧 placement@university.edu</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
