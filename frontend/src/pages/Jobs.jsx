import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getJobs } from '../services/jobsAPI';
import JobCard from '../components/JobCard';

const Jobs = () => {
  const { token, user } = useContext(AuthContext);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');

  useEffect(() => {
    const fetchJobs = async () => {
      if (!token) return;
      try {
        setLoading(true);
        // If recruiter, show their jobs first, or support toggle. Let's load all jobs for browsing.
        const data = await getJobs(token);
        setJobs(data);
      } catch (err) {
        setError(err.message || 'Failed to retrieve jobs list.');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [token]);

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
        <p>Retrieving job postings...</p>
      </div>
    );
  }

  // Filter jobs by name, company, and active status
  const filteredJobs = jobs.filter(job => {
    const title = job.title.toLowerCase();
    const company = job.companyName.toLowerCase();
    const query = searchTerm.toLowerCase();

    const matchesSearch = title.includes(query) || company.includes(query);
    const matchesStatus = statusFilter === 'All' || job.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="dashboard-header" style={{ marginBottom: 0 }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.25rem' }}>Job Openings</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Explore current full-time or internship drives active on campus</p>
        </div>
        
        {user && (user.role === 'admin' || user.role === 'company') && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <span className="badge badge-shortlisted" style={{ alignSelf: 'center' }}>
              Coordinator / Recruiter Mode
            </span>
          </div>
        )}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Filter and Search */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by job title, company name, skills..."
          className="form-control search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="form-control"
          style={{ width: '180px' }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="active">Active Drives</option>
          <option value="closed">Closed Drives</option>
          <option value="All">All Postings</option>
        </select>
      </div>

      {filteredJobs.length > 0 ? (
        <div className="grid">
          {filteredJobs.map(job => (
            <JobCard key={job._id} job={job} />
          ))}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          No job openings matching your search criteria were found.
        </div>
      )}
    </div>
  );
};

export default Jobs;
