import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { incrementMemberView } from '../services/api';
import Header from '../components/Header';
import './DetailPage.css';

const DetailPage = ({ members = [] }) => {
  const { id } = useParams();
  const member = members.find(m => String(m.id) === String(id));

  // メンバーの閲覧数をインクリメント (セッションにフラグがない場合のみ)
  useEffect(() => {
    if (member && id) {
      const sessionKey = `has_viewed_member_${id}`;
      const hasViewed = sessionStorage.getItem(sessionKey);
      if (!hasViewed) {
        incrementMemberView(id);
        sessionStorage.setItem(sessionKey, 'true');
      }
    }
  }, [id, member]);

  if (!member) {
    return (
      <div className="detail-page">
        <Header />
        <main className="main-content container" style={{ textAlign: 'center' }}>
          <p>メンバーが見つかりませんでした。</p>
          <Link to="/" className="back-link">トップページへ戻る</Link>
        </main>
      </div>
    );
  }

  // Googleマップの埋め込み用URLを抽出またはiframeをそのまま扱うための処理
  const renderMap = (mapData) => {
    if (!mapData) return null;
    
    // iframeタグがそのまま貼られた場合を考慮
    if (mapData.includes('<iframe')) {
      return (
        <div 
          className="map-container"
          dangerouslySetInnerHTML={{ __html: mapData.replace(/width="\d+"/, 'width="100%"').replace(/height="\d+"/, 'height="450"') }}
        />
      );
    }
    
    // URLのみの場合
    return (
      <div className="map-container">
        <iframe 
          src={mapData} 
          width="100%" 
          height="450" 
          style={{ border: 0 }} 
          allowFullScreen="" 
          loading="lazy"
          title="Google Map"
        ></iframe>
      </div>
    );
  };

  return (
    <div className="detail-page">
      <Header />
      <main className="main-content container">
        <div className="detail-card">
          <div className="detail-header">
            {/* メイン画像 */}
            {member.images && member.images.length > 0 ? (
              <a href={member.images[0]} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block' }}>
                <img 
                  src={member.images[0]} 
                  alt={member.name} 
                  className="detail-image" 
                  referrerPolicy="no-referrer"
                />
              </a>
            ) : (
              <img 
                src="" /* 画像がない場合のプレースホルダー等 */
                alt={member.name} 
                className="detail-image" 
                referrerPolicy="no-referrer"
              />
            )}
            <div className="detail-title">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h2>{member.name}</h2>
                {member.view_count !== undefined && (
                  <span className="detail-view-count">
                    <span style={{ fontSize: '1.2rem', marginRight: '4px' }}>👁️</span>
                    {Number(member.view_count).toLocaleString()}
                  </span>
                )}
              </div>
              <p className="detail-job">{member.job}</p>
              {member.company && <p className="detail-company">{member.company}</p>}
            </div>
          </div>

          {/* 画像ギャラリー（2枚目以降がある場合表示） */}
          {member.images && member.images.length > 1 && (
            <div className="detail-section">
              <h3>フォトギャラリー</h3>
              <div className="image-gallery">
                {member.images.map((img, idx) => (
                  <div key={idx} className="gallery-item">
                     <a href={img} target="_blank" rel="noopener noreferrer">
                        <img 
                          src={img} 
                          alt={`${member.name} ${idx + 1}`} 
                          referrerPolicy="no-referrer"
                        />
                     </a>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="detail-body">
            <div className="detail-section">
              <h3>詳細説明</h3>
              <p className="detail-text">{member.detail}</p>
            </div>
            
            <div className="detail-section">
              <h3>連絡先</h3>
              {member.contact && (member.contact.includes('line.me') || member.contact.includes('lin.ee')) ? (
                <div style={{ marginTop: '16px' }}>
                  <a 
                    href={member.contact} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="line-link-button"
                  >
                    LINEで連絡する
                  </a>
                </div>
              ) : (
                <p className="detail-text"><a href={member.contact && member.contact.includes('@') ? `mailto:${member.contact}` : member.contact} target="_blank" rel="noopener noreferrer">{member.contact}</a></p>
              )}
            </div>
            
            {member.sns_link && (
              <div className="detail-section">
                <h3>SNS</h3>
                <p className="detail-text">
                  <a href={member.sns_link} target="_blank" rel="noopener noreferrer">{member.sns_link}</a>
                </p>
              </div>
            )}

            {/* Google Map セクション */}
            {member.map_url && (
              <div className="detail-section">
                <h3>アクセス / 所在地</h3>
                {renderMap(member.map_url)}
              </div>
            )}
          </div>
        </div>
        
        <div className="back-box">
          <Link to="/" className="back-btn">← メンバー一覧に戻る</Link>
        </div>
      </main>
    </div>
  );
};

export default DetailPage;
