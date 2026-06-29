import React, { useContext } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logoutUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (!user) return '/';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'company') return '/company';
    return '/student';
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span style={{ fontSize: '1.6rem' }}>⚡</span> TechyPlacement
        </Link>

        <ul className="navbar-links">
          <li>
            <NavLink to="/" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
              Home
            </NavLink>
          </li>
          
          {user && (
            <>
              <li>
                <NavLink to={getDashboardPath()} className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
                  Dashboard
                </NavLink>
              </li>
              <li>
                <NavLink to="/jobs" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
                  Jobs
                </NavLink>
              </li>
              {user.role !== 'company' && (
                <li>
                  <NavLink to="/companies" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
                    Companies
                  </NavLink>
                </li>
              )}
              {user.role !== 'student' && (
                <li>
                  <NavLink to="/students" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
                    Students
                  </NavLink>
                </li>
              )}
              <li>
                <NavLink to="/applications" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
                  Applications
                </NavLink>
              </li>
            </>
          )}
        </ul>

        <div className="navbar-actions">
          {user ? (
            <>
              <Link to="/profile" className="btn btn-secondary btn-sm">
                👤 {user.name} ({user.role})
              </Link>
              <button onClick={handleLogout} className="btn btn-danger btn-sm">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
