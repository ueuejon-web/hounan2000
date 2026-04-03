import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import './AdminPage.css';

const AdminPage = ({ members, settings, onDelete, onUpdateIntro }) => {
  const [introText, setIntroText] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings && settings.adminIntroText) {
      setIntroText(settings.adminIntroText);
    }
  }, [settings]);

  const handleSaveIntro = async () => {
    setIsSaving(true);
    const success = await onUpdateIntro(introText);
    setIsSaving(false);
    if (success) {
      alert('紹介文を更新しました');
    } else {
      alert('更新に失敗しました');
    }
  };
  return (
    <div className="admin-page">
      <Header />
      <main className="main-content container">
        <div className="admin-header">
          <h2>管理者用 メンバー一覧</h2>
          <div className="admin-actions">
            <Link to="/admin/new" className="admin-add-btn">+ 新規メンバー登録</Link>
            <Link to="/" className="admin-back-home">トップへ戻る</Link>
          </div>
        </div>

        <div className="admin-table-container">
          {/* ...テーブル表示 (既存) ... */}
        </div>

        {/* サイト設定セクション */}
        <div className="admin-settings-section">
          <div className="admin-header">
            <h2>サイト全体設定・統計</h2>
          </div>
          
          <div className="settings-grid">
            <div className="settings-card views-card">
              <h3>アクセス統計</h3>
              <div className="admin-view-stats">
                <div className="stat-item">
                  <span className="stat-label">合計サイト閲覧数:</span>
                  <span className="stat-value">{Number(settings?.siteTotalViews || 0).toLocaleString()}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">管理者紹介閲覧数:</span>
                  <span className="stat-value">{Number(settings?.adminIntroViews || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="settings-card intro-editor-card">
              <h3>管理者紹介文の編集</h3>
              <textarea 
                className="admin-intro-textarea"
                value={introText}
                onChange={(e) => setIntroText(e.target.value)}
                placeholder="紹介文を入力してください..."
              />
              <div className="admin-intro-actions">
                <button 
                  className="admin-save-btn" 
                  onClick={handleSaveIntro}
                  disabled={isSaving}
                >
                  {isSaving ? '保存中...' : '紹介ページを更新する'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminPage;
