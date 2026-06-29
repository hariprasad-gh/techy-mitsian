import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>&copy; {new Date().getFullYear()} TechyPlacement Portal. All rights reserved.</p>
        <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Designed for modern campus recruitment workflows.</p>
      </div>
    </footer>
  );
};

export default Footer;
