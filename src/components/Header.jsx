import React from 'react';
import './Header.css';

const Header = () => {
  return (
    <header className="site-header">
      <div className="container">
        <div className="header-content">
          <img src="/rose-deco.png" alt="" className="header-deco deco-left" aria-hidden="true" />
          <h1>
            {/* ユーザーのロゴ画像がない場合はテキストフォールバックとして機能するよう実装 */}
            <img 
              src="/logo.png" 
              alt="豊南中2000年卒ポータルサイト" 
              className="site-logo"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <span className="header-title-text" style={{ display: 'none' }}>
              豊南中2000年卒ポータルサイト
            </span>
          </h1>
          <img src="/rose-deco.png" alt="" className="header-deco deco-right" aria-hidden="true" />
        </div>
      </div>
    </header>
  );
};

export default Header;
