import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getMyApplications } from '../services/applicationAPI';
import { getJobs } from '../services/jobsAPI';
import { getJobApplications } from '../services/applicationAPI';

const Applications = () => {
  const { user, token } = useContext(AuthContext);

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchApplications = async () => {
      if (!token || !user) return;
      try {
        setLoading(true);
        
        if (user.role === 'student') {
          const apps = await getMyApplications(token);
          setApplications(apps);
        } else if (user.role === 'company') {
          // Recruiters see applications for all their jobs aggregated
          const myJobs = await getJobs(token, true);
          const allAppsPromises = myJobs.map(job => getJobApplications(job._id, token));
          const results = await Promise.all(allAppsPromises);
          
          // Flatten array of arrays
          const flattened = results.flat().map((app, idx) => ({
            ...app,
            // Attach job info directly if missing
            job: app.job || myJobs.find(j => j._id === app.jobId) || {}
          }));
          setApplications(flattened);
        } else if (user.role === 'admin') {
          // Admins see a log of all selections and shortlists. Let's pull all jobs, then pull applications.
          // To keep it simple and performant, we can pull all jobs and load applications for each active job
          const allJobs = await getJobs(token);
          const activeJobs = allJobs.slice(0, 10); // Limit to top 10 recent jobs for admin log performance
          const allAppsPromises = activeJobs.map(job => 
            getJobApplications(job._id, token).catch(() => [])
          );
          const results = await Promise.all(allAppsPromises);
          
          // Enrich with job object
          const flattened = results.map((jobApps, index) => {
            const job = activeJobs[index];
            return jobApps.map(app => ({
              ...app,
              job
            }));
          }).flat();

          setApplications(flattened);
        }
      } catch (err) {
        setError('Failed to fetch applications logs.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [token, user]);

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
        <p>Loading application logs...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.25rem' }}>
          {user.role === 'student' ? 'My Applications' : 'Applications Log'}
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          {user.role === 'student' 
            ? 'Track the live progress and response timeline of your submitted job applications'
            : 'Consolidated tracking log of candidate submissions across active recruitment drives'
          }
        </p>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card">
        {applications.length > 0 ? (
          <div className="table-container" style={{ marginTop: 0 }}>
            <table>
              <thead>
                <tr>
                  {user.role !== 'student' && <th>Candidate</th>}
                  {user.role !== 'student' && <th>Roll / CGPA</th>}
                  <th>Job Role</th>
                  <th>Company</th>
                  <th>Applied On</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map(app => {
                  if (!app) return null;
                  const candidateName = app.student ? app.student.name : 'Candidate';
                  const candidateCgpa = app.studentProfile ? `⭐ ${app.studentProfile.cgpa}` : 'N/A';
                  const candidateRoll = app.studentProfile ? app.studentProfile.rollNumber : 'N/A';
                  const jobTitle = app.job ? app.job.title : 'Deleted Role';
                  const compName = app.job ? app.job.companyName : 'N/A';

                  return (
                    <tr key={app._id}>
                      {user.role !== 'student' && (
                        <td style={{ fontWeight: '600' }}>{candidateName}</td>
                      )}
                      {user.role !== 'student' && (
                        <td>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{candidateRoll}</span>
                          <div style={{ fontWeight: '500' }}>{candidateCgpa}</div>
                        </td>
                      )}
                      <td style={{ fontWeight: '600' }}>{jobTitle}</td>
                      <td>{compName}</td>
                      <td>{new Date(app.appliedAt).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge badge-${app.status}`}>
                          {app.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          {app.job && app.job._id && (
                            <Link to={`/jobs/${app.job._id}`} className="btn btn-secondary btn-sm">
                              Job Page
                            </Link>
                          )}
                          {user.role !== 'student' && app.resumeUrl && (
                            <a 
                              href={app.resumeUrl} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="btn btn-primary btn-sm"
                            >
                              Open Resume ↗
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            {user.role === 'student'
              ? "You haven't submitted any job applications yet."
              : "No candidate applications have been logged in the system yet."
            }
          </div>
        )}
      </div>
    </div>
  );
};

export default Applications;
