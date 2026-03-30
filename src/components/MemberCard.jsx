import React from 'react';
import { Link } from 'react-router-dom';
import './MemberCard.css';

const MemberCard = ({ member }) => {
  // 画像配列の先頭を使用（なければ空文字列）
  const thumbnail = member.images && member.images.length > 0 ? member.images[0] : "";

  return (
    <Link to={`/member/${member.id}`} className="member-card">
      <div className="card-image-wrap">
        {thumbnail && <img src={thumbnail} alt={member.name} className="card-image" />}
      </div>
      <div className="card-content">
        <h3 className="card-name">{member.name}</h3>
        <p className="card-job">{member.job}</p>
        <hr className="card-divider" />
        <p className="card-desc">{member.short_desc}</p>
      </div>
    </Link>
  );
};

export default MemberCard;
