import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Home = () => {
  const { user } = useContext(AuthContext);

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'company') return '/company';
    return '/student';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      <section className="hero animate-fade-in">
        <span className="hero-badge">Next-Gen Placement Hub</span>
        <h1>
          Empowering Careers, <br />
          Connecting <span className="hero-highlight">Talent</span>
        </h1>
        <p>
          A unified portal for students to discover opportunities, recruiters to scout top campus talent, and administrators to orchestrate placement activities seamlessly.
        </p>
        <div className="hero-cta">
          <Link to={getDashboardPath()} className="btn btn-primary">
            {user ? 'Go to Dashboard' : 'Get Started Now'}
          </Link>
          <Link to={user ? '/jobs' : '/login'} className="btn btn-secondary">
            Explore Openings
          </Link>
        </div>
      </section>

      <section style={{ padding: '2rem 0' }}>
        <h2 style={{ textAlign: 'center', fontSize: '1.8rem', marginBottom: '2.5rem', fontWeight: '800' }}>
          Tailored Workflows for Everyone
        </h2>
        <div className="features-grid">
          <div className="card feature-card">
            <div className="feature-icon">🎓</div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.75rem', fontWeight: '700' }}>For Students</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Build your academic profile, upload your resume, automatically check eligibility criteria for job roles, and submit applications with a single click.
            </p>
          </div>

          <div className="card feature-card">
            <div className="feature-icon">🏢</div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.75rem', fontWeight: '700' }}>For Recruiters</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Create rich job descriptions, specify academic Cut-Offs (CGPA, Branches), browse student resumes, and track candidates from screening to hiring.
            </p>
          </div>

          <div className="card feature-card">
            <div className="feature-icon">⚙️</div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.75rem', fontWeight: '700' }}>For Admins</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Orchestrate the entire drive. Monitor job posts, inspect applicant profiles, search and filter directories, and maintain complete records.
            </p>
          </div>
        </div>
      </section>

      <section className="card" style={{ padding: '3rem 2.5rem', textAlign: 'center', background: 'rgba(59, 130, 246, 0.02)', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '0.75rem' }}>Are you a Recruiter or Administrator?</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 1.5rem', fontSize: '0.95rem' }}>
          Create an employer profile to post internship/full-time opportunities or login to access administration dashboards.
        </p>
        <Link to="/register" className="btn btn-secondary">
          Register as Employer
        </Link>
      </section>
    </div>
  );
};

export default Home;
