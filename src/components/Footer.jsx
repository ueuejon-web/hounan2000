import React from 'react';
import './Footer.css';

const Footer = ({ siteViews = 0, adminViews = 0 }) => {
  return (
    <footer className="site-footer">
      <div className="container footer-content">
        <div className="footer-views">
          <span className="view-item">
            <span className="view-label">累計アクセス:</span>
            <span className="view-count">{Number(siteViews).toLocaleString()}</span>
          </span>
          <span className="view-divider">|</span>
          <span className="view-item">
            <span className="view-label">管理者紹介アクセス:</span>
            <span className="view-count">{Number(adminViews).toLocaleString()}</span>
          </span>
        </div>
        <div className="footer-copy">
          &copy; 2024 豊南中2000年卒 交流ポータル
        </div>
      </div>
    </footer>
  );
};

export default Footer;
