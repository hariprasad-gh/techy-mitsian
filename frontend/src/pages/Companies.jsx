import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getCompanies } from '../services/companyAPI';
import CompanyCard from '../components/CompanyCard';

const Companies = () => {
  const { token } = useContext(AuthContext);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCompanies = async () => {
      if (!token) return;
      try {
        setLoading(true);
        const data = await getCompanies(token);
        setCompanies(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch companies list.');
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, [token]);

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
        <p>Loading corporate directory...</p>
      </div>
    );
  }

  // Filter companies based on search
  const filteredCompanies = companies.filter(comp =>
    comp.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (comp.industry && comp.industry.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (comp.location && comp.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.25rem' }}>Recruiting Companies</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Browse corporate partners hiring through our placement cell</p>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by company name, industry, or location..."
          className="form-control search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredCompanies.length > 0 ? (
        <div className="grid">
          {filteredCompanies.map(comp => (
            <CompanyCard key={comp._id} company={comp} />
          ))}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          No recruiting companies found matching your search.
        </div>
      )}
    </div>
  );
};

export default Companies;
