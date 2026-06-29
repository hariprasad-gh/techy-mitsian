import React from 'react';

const StudentCard = ({ student }) => {
  const { user, rollNumber, cgpa, department, batch, skills, resumeUrl } = student;
  const studentName = user ? user.name : 'Unknown Student';
  const studentEmail = user ? user.email : '';

  return (
    <div className="card" style={{ borderLeft: '3px solid var(--accent-purple)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', height: '100%', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '2rem' }}>🎓</span>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '700' }}>{studentName}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{studentEmail}</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', margin: '0.75rem 0', padding: '0.5rem 0', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
            <div>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Dept / Batch</p>
              <p style={{ fontSize: '0.85rem', fontWeight: '600' }}>{department} ({batch})</p>
            </div>
            <div>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>CGPA / Roll</p>
              <p style={{ fontSize: '0.85rem', fontWeight: '600' }}>⭐ {cgpa} / {rollNumber}</p>
            </div>
          </div>

          <div style={{ margin: '0.75rem 0' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem', fontWeight: '600' }}>SKILLS</p>
            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
              {skills && skills.length > 0 ? (
                skills.map((skill, index) => (
                  <span key={index} className="badge badge-applied" style={{ fontSize: '0.65rem', textTransform: 'none', backgroundColor: 'rgba(139, 92, 246, 0.08)', color: 'var(--accent-purple)', borderColor: 'rgba(139, 92, 246, 0.2)' }}>
                    {skill}
                  </span>
                ))
              ) : (
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No skills listed.</span>
              )}
            </div>
          </div>
        </div>

        <div>
          {resumeUrl ? (
            <a 
              href={resumeUrl.startsWith('http') ? resumeUrl : `https://${resumeUrl}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn btn-primary btn-sm btn-block"
              style={{ textAlign: 'center' }}
            >
              📄 View Resume ↗
            </a>
          ) : (
            <button className="btn btn-secondary btn-sm btn-block" disabled>
              No Resume Uploaded
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentCard;
