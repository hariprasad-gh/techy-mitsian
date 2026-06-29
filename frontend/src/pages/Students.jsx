import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getStudents } from '../services/studentAPI';
import StudentCard from '../components/StudentCard';

const Students = () => {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [minCgpaFilter, setMinCgpaFilter] = useState('');

  useEffect(() => {
    // Redirect students away
    if (user && user.role === 'student') {
      navigate('/');
      return;
    }

    const fetchStudents = async () => {
      if (!token) return;
      try {
        setLoading(true);
        const data = await getStudents(token);
        setStudents(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch student directory.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [token, user, navigate]);

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
        <p>Loading candidate registry...</p>
      </div>
    );
  }

  // Filter students based on search, department, and CGPA
  const filteredStudents = students.filter(std => {
    const name = std.user ? std.user.name.toLowerCase() : '';
    const email = std.user ? std.user.email.toLowerCase() : '';
    const roll = std.rollNumber ? std.rollNumber.toLowerCase() : '';
    const query = searchTerm.toLowerCase();

    // Text search
    const matchesSearch = name.includes(query) || email.includes(query) || roll.includes(query);

    // Department filter
    const matchesDept = deptFilter === 'All' || std.department === deptFilter;

    // CGPA filter
    const cgpaVal = parseFloat(minCgpaFilter);
    const matchesCgpa = isNaN(cgpaVal) || std.cgpa >= cgpaVal;

    return matchesSearch && matchesDept && matchesCgpa;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.25rem' }}>Candidates Directory</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Inspect academic records, skills, and download resumes of active drive participants</p>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Filters & Search controls */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Search Name / Roll No</label>
            <input
              type="text"
              placeholder="Type candidate name or roll number..."
              className="form-control"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Department</label>
            <select
              className="form-control"
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
            >
              <option value="All">All Departments</option>
              <option value="CSE">Computer Science (CSE)</option>
              <option value="ECE">Electronics (ECE)</option>
              <option value="EEE">Electrical (EEE)</option>
              <option value="ME">Mechanical (ME)</option>
              <option value="CE">Civil (CE)</option>
              <option value="IT">Information Tech (IT)</option>
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Min CGPA Cut-off</label>
            <input
              type="number"
              step="0.1"
              placeholder="e.g. 7.5"
              className="form-control"
              value={minCgpaFilter}
              onChange={(e) => setMinCgpaFilter(e.target.value)}
            />
          </div>
        </div>
      </div>

      {filteredStudents.length > 0 ? (
        <div className="grid">
          {filteredStudents.map(std => (
            <StudentCard key={std._id} student={std} />
          ))}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          No candidate profiles found matching your filtering parameters.
        </div>
      )}
    </div>
  );
};

export default Students;
