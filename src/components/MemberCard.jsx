import React from 'react';
import { Link } from 'react-router-dom';
import './MemberCard.css';

const MemberCard = ({ member }) => {
  // 画像配列の先頭を使用（なければ空文字列）
  const thumbnail = member.images && member.images.length > 0 ? member.images[0] : "";

  return (
    <Link to={`/member/${member.id}`} className="member-card">
      <div className="card-image-wrap">
        {thumbnail ? (
          <img 
            src={thumbnail} 
            alt={member.name} 
            className="card-image" 
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="card-image-placeholder">
            <span className="rose-icon">🌹</span>
          </div>
        )}
      </div>
      <div className="card-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 className="card-name">{member.name}</h3>
          {member.view_count !== undefined && (
            <span className="card-view-count">
              <span style={{ fontSize: '0.9rem', marginRight: '2px' }}>👁️</span>
              {Number(member.view_count).toLocaleString()}
            </span>
          )}
        </div>
        <p className="card-job">{member.job}</p>
        <hr className="card-divider" />
        <p className="card-desc">{member.short_desc}</p>
      </div>
    </Link>
  );
};

export default MemberCard;
