import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getJobs, createJob, updateJob, deleteJob } from '../services/jobsAPI';
import { getJobApplications, updateApplicationStatus } from '../services/applicationAPI';

const CompanyDashboard = () => {
  const { user, token } = useContext(AuthContext);

  const [companyJobs, setCompanyJobs] = useState([]);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [error, setError] = useState('');

  // Active Job Applications management
  const [selectedJob, setSelectedJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [appError, setAppError] = useState('');

  // New job posting form state
  const [showPostJob, setShowPostJob] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [salary, setSalary] = useState('');
  const [location, setLocation] = useState('');
  const [minCGPA, setMinCGPA] = useState('6.0');
  const [allowedBranches, setAllowedBranches] = useState('CSE, ECE, IT');
  const [deadline, setDeadline] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [formError, setFormError] = useState('');

  const loadRecruiterData = async () => {
    if (!token) return;
    try {
      setLoadingDashboard(true);
      // Fetch only jobs posted by this company
      const jobs = await getJobs(token, true);
      setCompanyJobs(jobs);
    } catch (err) {
      setError('Failed to fetch company job postings.');
      console.error(err);
    } finally {
      setLoadingDashboard(false);
    }
  };

  useEffect(() => {
    loadRecruiterData();
  }, [token]);

  const handlePostJobSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormMessage('');

    const branchesArray = allowedBranches
      .split(',')
      .map(b => b.trim())
      .filter(Boolean);

    const payload = {
      title,
      description,
      requirements,
      salary,
      location,
      minCGPA: parseFloat(minCGPA),
      allowedBranches: branchesArray,
      deadline
    };

    try {
      await createJob(payload, token);
      setFormMessage('Job posting created successfully!');
      setTitle('');
      setDescription('');
      setRequirements('');
      setSalary('');
      setLocation('');
      setMinCGPA('6.0');
      setAllowedBranches('CSE, ECE, IT');
      setDeadline('');
      setTimeout(() => {
        setFormMessage('');
        setShowPostJob(false);
      }, 2000);
      loadRecruiterData();
    } catch (err) {
      setFormError(err.message || 'Failed to create job posting.');
    }
  };

  const handleViewApplications = async (job) => {
    setSelectedJob(job);
    setApplications([]);
    setAppError('');
    setLoadingApps(true);
    try {
      const apps = await getJobApplications(job._id, token);
      setApplications(apps);
    } catch (err) {
      setAppError(err.message || 'Failed to load applications for this job.');
    } finally {
      setLoadingApps(false);
    }
  };

  const handleStatusUpdate = async (appId, newStatus) => {
    try {
      await updateApplicationStatus(appId, newStatus, token);
      
      // Update applications state locally
      setApplications(prevApps => 
        prevApps.map(app => 
          app._id === appId ? { ...app, status: newStatus } : app
        )
      );
    } catch (err) {
      alert(`Failed to update status: ${err.message}`);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job posting? This action cannot be undone.')) return;
    try {
      await deleteJob(jobId, token);
      setCompanyJobs(prev => prev.filter(j => j._id !== jobId));
      if (selectedJob && selectedJob._id === jobId) {
        setSelectedJob(null);
        setApplications([]);
      }
    } catch (err) {
      alert(`Failed to delete job: ${err.message}`);
    }
  };

  if (loadingDashboard) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
        <p>Loading recruiter portal...</p>
      </div>
    );
  }

  // Calculate quick metrics for dashboard cards
  const totalPostings = companyJobs.length;
  // Note: we don't have total applications globally unless we count them across jobs or retrieve all apps. 
  // Let's keep it simple or calculate if needed.

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header */}
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>Recruiter Panel - {user.profile ? user.profile.companyName : user.name}</h1>
          <p>Create and manage job drive postings, download student resumes, and select candidates</p>
        </div>
        <div>
          <button 
            onClick={() => setShowPostJob(!showPostJob)} 
            className="btn btn-primary"
          >
            {showPostJob ? 'Cancel Listing' : '➕ Post New Job Opening'}
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Stats bar */}
      <div className="stats-bar">
        <div className="stat-card">
          <span className="stat-label">Active Job Openings</span>
          <span className="stat-value">{companyJobs.filter(j => j.status === 'active').length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total Postings Created</span>
          <span className="stat-value">{totalPostings}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Location sector</span>
          <span className="stat-value" style={{ fontSize: '1.2rem', marginTop: '0.5rem', fontWeight: '700' }}>
            📍 {user.profile ? user.profile.location || 'Not Configured' : 'N/A'}
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Industry field</span>
          <span className="stat-value" style={{ fontSize: '1.2rem', marginTop: '0.5rem', fontWeight: '700' }}>
            💼 {user.profile ? user.profile.industry || 'Technology' : 'N/A'}
          </span>
        </div>
      </div>

      <div className="dashboard-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Post Job Form */}
          {showPostJob && (
            <div className="card">
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '1.5rem' }}>Create Job Opportunity</h2>
              {formError && <div className="alert alert-danger">{formError}</div>}
              {formMessage && <div className="alert alert-success">{formMessage}</div>}

              <form onSubmit={handlePostJobSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Job Title / Role</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="e.g. Associate Software Developer" 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Location</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="e.g. Bangalore, KA (Hybrid)" 
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      required 
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>CTC Salary Package Offered</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="e.g. 10 LPA - 12 LPA" 
                      value={salary}
                      onChange={(e) => setSalary(e.target.value)}
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Application Deadline</label>
                    <input 
                      type="date" 
                      className="form-control" 
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      required 
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Minimum Eligible CGPA Cut-Off</label>
                    <input 
                      type="number" 
                      step="0.1" 
                      className="form-control" 
                      value={minCGPA}
                      onChange={(e) => setMinCGPA(e.target.value)}
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Eligible Branches / Departments (comma separated)</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="e.g. CSE, ECE, IT" 
                      value={allowedBranches}
                      onChange={(e) => setAllowedBranches(e.target.value)}
                      required 
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Detailed Job Description</label>
                  <textarea 
                    rows="3" 
                    className="form-control" 
                    placeholder="Provide overview of the role and responsibilities..." 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  ></textarea>
                </div>

                <div className="form-group">
                  <label>Role Requirements & Qualifications</label>
                  <textarea 
                    rows="3" 
                    className="form-control" 
                    placeholder="List required skills (e.g. React, Node.js, DSA, Strong Communication)..." 
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    required
                  ></textarea>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button type="submit" className="btn btn-primary">Post Job Drive</button>
                  <button type="button" onClick={() => setShowPostJob(false)} className="btn btn-secondary">Cancel</button>
                </div>
              </form>
            </div>
          )}

          {/* Recruiter Active Listings */}
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '1.25rem' }}>Active Job Postings</h2>
            
            {companyJobs.length > 0 ? (
              <div className="grid">
                {companyJobs.map(job => (
                  <div key={job._id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyBlock: 'space-between', minHeight: '260px' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: '800' }}>{job.title}</h3>
                        <span className={`badge badge-${job.status}`}>{job.status}</span>
                      </div>
                      
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                        📍 {job.location} | 💰 {job.salary}
                      </p>

                      <div style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', fontSize: '0.75rem', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <div>
                          <span style={{ color: 'var(--text-muted)' }}>Cut-off CGPA: </span>
                          <span style={{ fontWeight: '600' }}>⭐ {job.minCGPA}</span>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-muted)' }}>Deadline: </span>
                          <span style={{ fontWeight: '500' }}>{new Date(job.deadline).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                      <button 
                        onClick={() => handleViewApplications(job)} 
                        className="btn btn-primary btn-sm"
                        style={{ flex: 1 }}
                      >
                        👥 View Applicants
                      </button>
                      <button 
                        onClick={() => handleDeleteJob(job._id)} 
                        className="btn btn-secondary btn-sm"
                        style={{ color: 'var(--color-rejected)', border: '1px solid rgba(239, 68, 68, 0.2)' }}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-secondary)' }}>
                You haven't posted any job openings yet. Click the "Post New Job Opening" button to create one.
              </div>
            )}
          </div>

          {/* Applications list view for selected job */}
          {selectedJob && (
            <div className="card animate-fade-in" style={{ borderLeft: '3px solid var(--accent-purple)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: '800' }}>Applicants for "{selectedJob.title}"</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Filter eligibility cut-off: CGPA &ge; {selectedJob.minCGPA}</p>
                </div>
                <button onClick={() => setSelectedJob(null)} className="btn btn-secondary btn-sm">Close Panel</button>
              </div>

              {loadingApps ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <div className="loader" style={{ margin: '0 auto 0.75rem' }}></div>
                  <p style={{ color: 'var(--text-secondary)' }}>Retrieving applicant submissions...</p>
                </div>
              ) : appError ? (
                <div className="alert alert-danger">{appError}</div>
              ) : applications.length > 0 ? (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Candidate</th>
                        <th>Roll Number</th>
                        <th>Dept / Batch</th>
                        <th>CGPA</th>
                        <th>Resume</th>
                        <th>Application Status</th>
                        <th>Recruitment Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.map(app => (
                        <tr key={app._id}>
                          <td style={{ fontWeight: '600' }}>{app.student ? app.student.name : 'Unknown Candidate'}</td>
                          <td>{app.studentProfile ? app.studentProfile.rollNumber : 'N/A'}</td>
                          <td>
                            {app.studentProfile ? `${app.studentProfile.department} (${app.studentProfile.batch})` : 'N/A'}
                          </td>
                          <td>
                            <strong style={{ color: app.studentProfile && app.studentProfile.cgpa >= selectedJob.minCGPA ? 'var(--color-selected)' : 'var(--color-rejected)' }}>
                              ⭐ {app.studentProfile ? app.studentProfile.cgpa : '0.00'}
                            </strong>
                          </td>
                          <td>
                            <a 
                              href={app.resumeUrl} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              style={{ color: 'var(--accent-blue)', textDecoration: 'underline', fontWeight: '500', fontSize: '0.9rem' }}
                            >
                              Open Resume ↗
                            </a>
                          </td>
                          <td>
                            <span className={`badge badge-${app.status}`}>
                              {app.status}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.35rem' }}>
                              {app.status === 'applied' && (
                                <button 
                                  onClick={() => handleStatusUpdate(app._id, 'shortlisted')} 
                                  className="btn btn-primary btn-sm"
                                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', backgroundColor: 'var(--color-shortlisted)' }}
                                >
                                  Shortlist
                                </button>
                              )}
                              {app.status === 'shortlisted' && (
                                <button 
                                  onClick={() => handleStatusUpdate(app._id, 'selected')} 
                                  className="btn btn-primary btn-sm"
                                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', backgroundColor: 'var(--color-selected)' }}
                                >
                                  Select
                                </button>
                              )}
                              {app.status !== 'selected' && app.status !== 'rejected' && (
                                <button 
                                  onClick={() => handleStatusUpdate(app._id, 'rejected')} 
                                  className="btn btn-danger btn-sm"
                                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                                >
                                  Reject
                                </button>
                              )}
                              {(app.status === 'selected' || app.status === 'rejected') && (
                                <button
                                  onClick={() => handleStatusUpdate(app._id, 'applied')}
                                  className="btn btn-secondary btn-sm"
                                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}
                                >
                                  Reset Stage
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                  No applications received yet for this job drive.
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;
