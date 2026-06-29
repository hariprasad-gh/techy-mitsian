import React from 'react';

const CompanyCard = ({ company }) => {
  const { companyName, website, description, industry, location } = company;

  return (
    <div className="card">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', height: '100%', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🏢</span>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>{companyName}</h3>
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
            <span className="badge badge-shortlisted" style={{ fontSize: '0.7rem' }}>{industry || 'Technology'}</span>
            {location && (
              <span className="badge badge-applied" style={{ fontSize: '0.7rem', backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', borderColor: 'rgba(255,255,255,0.1)' }}>
                📍 {location}
              </span>
            )}
          </div>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '1rem' }}>
            {description || 'No description provided by the recruiter.'}
          </p>
        </div>

        <div>
          {website && (
            <a 
              href={website.startsWith('http') ? website : `https://${website}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn btn-secondary btn-sm btn-block"
              style={{ textAlign: 'center', display: 'block' }}
            >
              Visit Website ↗
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyCard;
