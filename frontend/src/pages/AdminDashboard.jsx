import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getJobs } from '../services/jobsAPI';
import { getStudents } from '../services/studentAPI';
import { getCompanies } from '../services/companyAPI';

const AdminDashboard = () => {
  const { token } = useContext(AuthContext);

  const [jobs, setJobs] = useState([]);
  const [students, setStudents] = useState([]);
  const [companies, setCompanies] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('students');

  useEffect(() => {
    const loadAdminData = async () => {
      if (!token) return;
      try {
        setLoading(true);
        const [allJobs, allStudents, allCompanies] = await Promise.all([
          getJobs(token),
          getStudents(token),
          getCompanies(token)
        ]);
        setJobs(allJobs);
        setStudents(allStudents);
        setCompanies(allCompanies);
      } catch (err) {
        setError('Failed to retrieve administrative data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadAdminData();
  }, [token]);

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
        <p>Loading administrative dashboard...</p>
      </div>
    );
  }

  // Calculate high-level stats
  const totalStudents = students.length;
  const totalCompanies = companies.length;
  const totalJobs = jobs.length;
  
  // Calculate selected candidate counts (mocked by viewing applications or querying stats)
  // Let's check how many active jobs are running
  const activeJobs = jobs.filter(j => j.status === 'active').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header */}
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>T&P Coordinator Control Center</h1>
          <p>Supervise student qualifications, view employer credentials, and track recruitment progress</p>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Stats bar */}
      <div className="stats-bar">
        <div className="stat-card" style={{ borderLeft: '3px solid var(--accent-purple)' }}>
          <span className="stat-label">Registered Students</span>
          <span className="stat-value" style={{ color: 'var(--accent-purple)' }}>{totalStudents}</span>
        </div>
        <div className="stat-card" style={{ borderLeft: '3px solid var(--accent-blue)' }}>
          <span className="stat-label">Recruiter Companies</span>
          <span className="stat-value" style={{ color: 'var(--accent-blue)' }}>{totalCompanies}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total Job Listings</span>
          <span className="stat-value">{totalJobs}</span>
        </div>
        <div className="stat-card" style={{ borderLeft: '3px solid var(--color-selected)' }}>
          <span className="stat-label">Active Drives</span>
          <span className="stat-value" style={{ color: 'var(--color-selected)' }}>{activeJobs}</span>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="tabs">
        <button 
          onClick={() => setActiveTab('students')} 
          className={`tab-btn ${activeTab === 'students' ? 'active' : ''}`}
        >
          🎓 Candidates Directory ({totalStudents})
        </button>
        <button 
          onClick={() => setActiveTab('companies')} 
          className={`tab-btn ${activeTab === 'companies' ? 'active' : ''}`}
        >
          🏢 Employer Accounts ({totalCompanies})
        </button>
        <button 
          onClick={() => setActiveTab('jobs')} 
          className={`tab-btn ${activeTab === 'jobs' ? 'active' : ''}`}
        >
          📋 Job Listings ({totalJobs})
        </button>
      </div>

      {/* Tab Panels */}
      <div className="card">
        {activeTab === 'students' && (
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '1rem' }}>Students Master Directory</h2>
            {students.length > 0 ? (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Roll Number</th>
                      <th>Email</th>
                      <th>Department</th>
                      <th>CGPA</th>
                      <th>Graduation Year</th>
                      <th>Resume</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(std => (
                      <tr key={std._id}>
                        <td style={{ fontWeight: '600' }}>{std.user ? std.user.name : 'N/A'}</td>
                        <td>{std.rollNumber}</td>
                        <td>{std.user ? std.user.email : 'N/A'}</td>
                        <td>{std.department}</td>
                        <td><strong>⭐ {std.cgpa}</strong></td>
                        <td>{std.batch}</td>
                        <td>
                          {std.resumeUrl ? (
                            <a href={std.resumeUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-blue)', textDecoration: 'underline' }}>
                              Open Resume ↗
                            </a>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No resume</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ color: 'var(--text-secondary)', padding: '1rem 0' }}>No student profiles registered in the system yet.</p>
            )}
          </div>
        )}

        {activeTab === 'companies' && (
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '1rem' }}>Registered Employer Partners</h2>
            {companies.length > 0 ? (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Company Name</th>
                      <th>Industry Sector</th>
                      <th>Headquarters</th>
                      <th>Website</th>
                      <th>Contact Email</th>
                      <th>Registration Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {companies.map(comp => (
                      <tr key={comp._id}>
                        <td style={{ fontWeight: '600' }}>{comp.companyName}</td>
                        <td><span className="badge badge-shortlisted">{comp.industry || 'Technology'}</span></td>
                        <td>📍 {comp.location || 'N/A'}</td>
                        <td>
                          {comp.website ? (
                            <a href={comp.website} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-blue)', textDecoration: 'underline' }}>
                              {comp.website.replace(/(^\w+:|^)\/\//, '')} ↗
                            </a>
                          ) : (
                            'N/A'
                          )}
                        </td>
                        <td>{comp.user ? comp.user.email : 'N/A'}</td>
                        <td>{new Date(comp.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ color: 'var(--text-secondary)', padding: '1rem 0' }}>No company partner accounts registered yet.</p>
            )}
          </div>
        )}

        {activeTab === 'jobs' && (
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '1rem' }}>Active Job Drives</h2>
            {jobs.length > 0 ? (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Role</th>
                      <th>Company</th>
                      <th>CTC Salary</th>
                      <th>Min CGPA Cut-off</th>
                      <th>Target Branches</th>
                      <th>Deadline</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map(job => (
                      <tr key={job._id}>
                        <td style={{ fontWeight: '600' }}>{job.title}</td>
                        <td>{job.companyName}</td>
                        <td><span className="badge badge-applied">{job.salary}</span></td>
                        <td>⭐ {job.minCGPA}</td>
                        <td>{job.allowedBranches && job.allowedBranches.length > 0 ? job.allowedBranches.join(', ') : 'All Branches'}</td>
                        <td>{new Date(job.deadline).toLocaleDateString()}</td>
                        <td>
                          <span className={`badge badge-${job.status}`}>
                            {job.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ color: 'var(--text-secondary)', padding: '1rem 0' }}>No job openings posted yet.</p>
            )}
          </div>
        )}
      </div>

    </div>
  );
};

export default AdminDashboard;
