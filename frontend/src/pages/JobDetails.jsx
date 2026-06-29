import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getJobById } from '../services/jobsAPI';
import { applyForJob, getMyApplications, getJobApplications, updateApplicationStatus } from '../services/applicationAPI';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useContext(AuthContext);

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Student apply states
  const [hasApplied, setHasApplied] = useState(false);
  const [myAppStatus, setMyAppStatus] = useState('');
  const [applyLoading, setApplyLoading] = useState(false);
  const [applyMessage, setApplyMessage] = useState('');
  const [applyError, setApplyError] = useState('');

  // Recruiter applicant states
  const [applicants, setApplicants] = useState([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);

  const fetchJobDetails = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await getJobById(id, token);
      setJob(data);

      if (user.role === 'student') {
        const apps = await getMyApplications(token);
        const application = apps.find(app => app.job && app.job._id === id);
        if (application) {
          setHasApplied(true);
          setMyAppStatus(application.status);
        }
      } else {
        // Companies and Admins see applicant list
        setLoadingApplicants(true);
        const apps = await getJobApplications(id, token);
        setApplicants(apps);
        setLoadingApplicants(false);
      }
    } catch (err) {
      setError(err.message || 'Failed to retrieve job details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobDetails();
  }, [id, token, user]);

  const handleApply = async () => {
    setApplyError('');
    setApplyMessage('');
    setApplyLoading(true);
    try {
      const app = await applyForJob(id, token);
      setHasApplied(true);
      setMyAppStatus('applied');
      setApplyMessage('Application submitted successfully!');
    } catch (err) {
      setApplyError(err.message || 'Failed to submit application.');
    } finally {
      setApplyLoading(false);
    }
  };

  const handleStatusUpdate = async (appId, newStatus) => {
    try {
      await updateApplicationStatus(appId, newStatus, token);
      setApplicants(prev => 
        prev.map(app => app._id === appId ? { ...app, status: newStatus } : app)
      );
    } catch (err) {
      alert(`Failed to update status: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
        <p>Loading opportunity specifications...</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div style={{ maxWidth: '600px', margin: '2rem auto' }}>
        <div className="alert alert-danger">{error || 'Job posting not found.'}</div>
        <Link to="/jobs" className="btn btn-secondary">← Back to Job Openings</Link>
      </div>
    );
  }

  // Calculate Student Eligibility details
  const checkEligibility = () => {
    if (!user || user.role !== 'student' || !user.profile) return { isEligible: true, reason: '' };

    const studentCGPA = user.profile.cgpa || 0;
    const studentDept = user.profile.department || '';

    if (studentCGPA < job.minCGPA) {
      return { isEligible: false, reason: `Your CGPA (${studentCGPA}) is lower than the minimum required CGPA of ${job.minCGPA}.` };
    }

    if (job.allowedBranches && job.allowedBranches.length > 0 && studentDept) {
      const allowed = job.allowedBranches.some(b => b.toLowerCase() === studentDept.toLowerCase());
      if (!allowed) {
        return { isEligible: false, reason: `Your branch/department (${studentDept}) is not eligible for this role. Eligible branches: ${job.allowedBranches.join(', ')}.` };
      }
    }

    return { isEligible: true, reason: '' };
  };

  const { isEligible, reason } = checkEligibility();
  const isDeadlinePassed = new Date() > new Date(job.deadline);
  const isClosed = job.status === 'closed' || isDeadlinePassed;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }} className="animate-fade-in">
      
      {/* Breadcrumb */}
      <div>
        <Link to="/jobs" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
          ← Back to all Job Openings
        </Link>
      </div>

      <div className="dashboard-grid">
        {/* Main Details Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="card">
            <div className="details-header">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h1 style={{ fontSize: '1.8rem', fontWeight: '800' }}>{job.title}</h1>
                  <h2 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--accent-blue)', marginTop: '0.25rem' }}>
                    🏢 {job.companyName}
                  </h2>
                </div>
                <div>
                  {isClosed ? (
                    <span className="badge badge-closed" style={{ fontSize: '0.9rem', padding: '0.4rem 1rem' }}>Closed</span>
                  ) : (
                    <span className="badge badge-selected" style={{ fontSize: '0.9rem', padding: '0.4rem 1rem' }}>Active Drive</span>
                  )}
                </div>
              </div>

              <div className="metadata-grid">
                <div className="metadata-item">
                  <span className="metadata-label">Annual CTC Package</span>
                  <span className="metadata-value" style={{ color: 'var(--color-applied)' }}>💰 {job.salary}</span>
                </div>
                <div className="metadata-item">
                  <span className="metadata-label">Job Location</span>
                  <span className="metadata-value">📍 {job.location}</span>
                </div>
                <span className="metadata-item">
                  <span className="metadata-label">Application Cut-off</span>
                  <span className="metadata-value" style={{ color: isDeadlinePassed ? 'var(--color-rejected)' : 'inherit' }}>
                    📅 {new Date(job.deadline).toLocaleDateString()} {isDeadlinePassed && '(Expired)'}
                  </span>
                </span>
              </div>
            </div>

            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.5rem' }}>Role Description</h3>
            <p style={{ color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
              {job.description}
            </p>

            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.5rem' }}>Requirements & Qualifications</h3>
            <p style={{ color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', fontSize: '0.95rem' }}>
              {job.requirements}
            </p>
          </div>

          {/* Recruiter applicants check */}
          {user.role !== 'student' && (
            <div className="card">
              <h2 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '1rem' }}>Candidates Submissions</h2>
              
              {loadingApplicants ? (
                <p>Loading submissions...</p>
              ) : applicants.length > 0 ? (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Candidate</th>
                        <th>Academics</th>
                        <th>Date Applied</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applicants.map(app => (
                        <tr key={app._id}>
                          <td style={{ fontWeight: '600' }}>
                            {app.student ? app.student.name : 'Unknown Candidate'}
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              {app.student ? app.student.email : ''}
                            </div>
                          </td>
                          <td>
                            <div style={{ fontSize: '0.85rem', fontWeight: '500' }}>
                              Dept: {app.studentProfile ? app.studentProfile.department : 'N/A'}
                            </div>
                            <div style={{ fontSize: '0.85rem' }}>
                              CGPA: <strong>⭐ {app.studentProfile ? app.studentProfile.cgpa : '0.0'}</strong>
                            </div>
                          </td>
                          <td>{new Date(app.appliedAt).toLocaleDateString()}</td>
                          <td>
                            <span className={`badge badge-${app.status}`}>{app.status}</span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.25rem' }}>
                              <a 
                                href={app.resumeUrl} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                              >
                                Resume
                              </a>
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
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p style={{ color: 'var(--text-secondary)', padding: '1rem 0' }}>No candidates have applied to this drive yet.</p>
              )}
            </div>
          )}

        </div>

        {/* Sidebar Status / Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Eligibility info card */}
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              Academic Thresholds
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Cut-off CGPA: </span>
                <span style={{ fontWeight: '600' }}>⭐ {job.minCGPA}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Branch Cut-off: </span>
                <span style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>
                  {job.allowedBranches && job.allowedBranches.length > 0 ? job.allowedBranches.join(', ') : 'All Branches'}
                </span>
              </div>
            </div>
          </div>

          {/* Student action card */}
          {user.role === 'student' && (
            <div className="card" style={{ borderLeft: '3px solid var(--accent-purple)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem' }}>Your Application</h3>
              
              {applyError && <div className="alert alert-danger" style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem' }}>{applyError}</div>}
              {applyMessage && <div className="alert alert-success" style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem' }}>{applyMessage}</div>}

              {hasApplied ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'center' }}>
                  <div className={`badge badge-${myAppStatus}`} style={{ padding: '0.5rem', justifyContent: 'center', fontSize: '0.85rem' }}>
                    Application stage: {myAppStatus}
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Your application is currently active. The company recruiter will notify you of stage selections.
                  </p>
                </div>
              ) : isClosed ? (
                <button className="btn btn-secondary btn-block" disabled>
                  Applications Closed
                </button>
              ) : !isEligible ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <span className="badge badge-rejected" style={{ padding: '0.5rem', justifyContent: 'center' }}>✗ Ineligible to Apply</span>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{reason}</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <span className="badge badge-selected" style={{ padding: '0.5rem', justifyContent: 'center' }}>✓ You are Eligible</span>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Your profile values (CGPA and Department) satisfy recruiter thresholds.
                  </p>
                  <button 
                    onClick={handleApply} 
                    className="btn btn-primary btn-block"
                    disabled={applyLoading}
                  >
                    {applyLoading ? 'Submitting...' : 'Apply for Job'}
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default JobDetails;
