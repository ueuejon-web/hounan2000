import React from 'react';
import './Footer.css';

const Footer = ({ totalViews }) => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="main-footer">
      <div className="footer-content container">
        <div className="footer-info">
          <p className="copyright">&copy; {currentYear} 豊南中2000年卒ポータル</p>
        </div>
        
        {totalViews !== undefined && (
          <div className="footer-stats">
            <span className="stats-label">累計サイト閲覧数:</span>
            <span className="stats-value">{totalViews.toLocaleString()}回</span>
          </div>
        )}
      </div>
    </footer>
  );
};

export default Footer;
