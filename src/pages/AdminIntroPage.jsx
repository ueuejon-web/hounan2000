import React from 'react';
import { Link } from 'react-router-dom';
import './AdminIntroPage.css';

const AdminIntroPage = () => {
  return (
    <div className="admin-intro-container">
      <div className="admin-intro-content">
        <div className="admin-intro-logo">
          <img src="/footer-logo.png" alt="上ブ.デザイン" />
        </div>
        
        <div className="admin-intro-text">
          <p>
            こんな所まで見て頂きありがとうございます。架空のクリエイティブスタジオ「上ブ.デザイン」代表の上田です。はい、こんな会社実在しません(笑)趣味というか興味が湧くとやりたくなってしまうタチで、LINE公式アカウントだけでは飽き足らずこんなサイトまで作ってしまいました。なので機能しなくても目的は達成したと言えます。
          </p>
          <p>
            とは言え「どうせお金落とすなら同級生に落とした方がいいじゃん」とは本気で思ってるので、機能してくれたら良いなと思います。
          </p>
          <p>
            「ホームページ作りたい！」とか「公式アカウント作りたい！」とか要望あればご連絡ください。
            有料でならやりますので(笑)
          </p>
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
