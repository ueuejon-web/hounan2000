import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { incrementViewCount } from '../services/api';
import './AdminIntroPage.css';

const AdminIntroPage = ({ settings, onRefresh }) => {
  const navigate = useNavigate();
  const [clickCount, setClickCount] = useState(0);
  const clickTimeoutRef = useRef(null);

  const handleLogoClick = () => {
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }
    const newCount = clickCount + 1;
    setClickCount(newCount);

    if (newCount >= 5) {
      setClickCount(0);
      navigate('/admin'); // 5回クリックで管理者画面へ
    } else {
      // 1秒以内に次のクリックがなければリセット
      clickTimeoutRef.current = setTimeout(() => {
        setClickCount(0);
      }, 1000);
    }
  };

  // ページ表示時に閲覧数をカウントアップ
  useEffect(() => {
    const trackView = async () => {
      if (!sessionStorage.getItem('admin_intro_viewed')) {
        const result = await incrementViewCount('adminIntroViews');
        if (result && result.status === 'success') {
          sessionStorage.setItem('admin_intro_viewed', 'true');
          if (onRefresh) onRefresh(); // 親コンポーネントの状態を更新
        }
      }
    };
    trackView();
  }, [onRefresh]);

  return (
    <div className="admin-intro-container">
      <div className="admin-intro-content">
        <div 
          className="admin-intro-logo" 
          onClick={handleLogoClick} 
          style={{ cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}
        >
          <img src="/footer-logo.png" alt="上ブ.デザイン" />
        </div>
        
        <div className="admin-intro-text">
          {settings.adminIntroText ? (
            settings.adminIntroText.split('\n').map((line, i) => (
              <p key={i}>{line || '\u00A0'}</p>
            ))
          ) : (
            <>
              <p>読み込み中...</p>
            </>
          )}
        </div>

        <div className="admin-intro-links">
          <a 
            href="https://line.me/ti/p/V_PUA9-qtf" 
            target="_blank" 
            rel="noopener noreferrer"
            className="line-link-button"
          >
            LINEで連絡する
          </a>
          <div className="back-link">
            <Link to="/">ホームに戻る</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminIntroPage;
