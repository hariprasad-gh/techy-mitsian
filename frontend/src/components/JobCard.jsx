import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const JobCard = ({ job }) => {
  const { user } = useContext(AuthContext);
  const { _id, title, companyName, salary, location, minCGPA, allowedBranches, deadline, status } = job;

  // Calculate student eligibility
  const checkEligibility = () => {
    if (!user || user.role !== 'student' || !user.profile) return { isEligible: true, reason: '' };

    const studentCGPA = user.profile.cgpa || 0;
    const studentDept = user.profile.department || '';

    if (studentCGPA < minCGPA) {
      return { 
        isEligible: false, 
        reason: `CGPA ${studentCGPA} < ${minCGPA}` 
      };
    }

    if (allowedBranches && allowedBranches.length > 0 && studentDept) {
      const allowed = allowedBranches.some(b => b.toLowerCase() === studentDept.toLowerCase());
      if (!allowed) {
        return { 
          isEligible: false, 
          reason: `Branch not eligible` 
        };
      }
    }

    return { isEligible: true, reason: '' };
  };

  const { isEligible, reason } = checkEligibility();
  const isDeadlinePassed = new Date() > new Date(deadline);
  const isClosed = status === 'closed' || isDeadlinePassed;

  return (
    <div className="card" style={{ borderLeft: isClosed ? '3px solid var(--text-muted)' : '3px solid var(--accent-blue)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', height: '100%', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', lineHeight: '1.2' }}>{title}</h3>
            {isClosed ? (
              <span className="badge badge-closed">Closed</span>
            ) : (
              <span className="badge badge-selected" style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)', color: 'var(--color-selected)', borderColor: 'rgba(16, 185, 129, 0.2)' }}>
                Active
              </span>
            )}
          </div>
          
          <p style={{ color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.95rem', marginBottom: '0.5rem' }}>
            🏢 {companyName}
          </p>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
            <span className="badge badge-applied" style={{ fontSize: '0.7rem' }}>💰 {salary}</span>
            <span className="badge badge-shortlisted" style={{ fontSize: '0.7rem' }}>📍 {location}</span>
          </div>

          <div style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Min CGPA:</span>
              <span style={{ fontWeight: '600' }}>⭐ {minCGPA}</span>
            </div>
            {allowedBranches && allowedBranches.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Branches:</span>
                <span style={{ fontWeight: '500', color: 'var(--text-secondary)' }}>{allowedBranches.join(', ')}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.25rem', marginTop: '0.25rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Deadline:</span>
              <span style={{ fontWeight: '500', color: isDeadlinePassed ? 'var(--color-rejected)' : 'var(--text-primary)' }}>
                {new Date(deadline).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {user && user.role === 'student' && !isClosed && (
            <div style={{ textAlign: 'center' }}>
              {isEligible ? (
                <span className="badge badge-selected" style={{ fontSize: '0.75rem', width: '100%', justifyContent: 'center' }}>✓ Eligible to Apply</span>
              ) : (
                <span className="badge badge-rejected" style={{ fontSize: '0.75rem', width: '100%', justifyContent: 'center' }}>✗ Ineligible: {reason}</span>
              )}
            </div>
          )}

          <Link to={`/jobs/${_id}`} className="btn btn-secondary btn-sm btn-block" style={{ textAlign: 'center' }}>
            Details & Apply →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default JobCard;
