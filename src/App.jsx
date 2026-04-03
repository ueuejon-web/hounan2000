import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import DetailPage from './pages/DetailPage';
import AdminPage from './pages/AdminPage';
import AdminEditPage from './pages/AdminEditPage';
import AdminIntroPage from './pages/AdminIntroPage';
import { fetchMembers, saveMember, deleteMemberFromDB, fetchSettings, incrementViewCount, updateSettings } from './services/api.js';
import './App.css';
import ScrollToTop from './components/ScrollToTop';
import Footer from './components/Footer';
import { Link, useLocation } from 'react-router-dom';

function App() {
  const [members, setMembers] = useState([]);
  const [settings, setSettings] = useState({ adminIntroText: '', siteTotalViews: 0, adminIntroViews: 0 });
  const [loading, setLoading] = useState(true);

  // 起動時にGASからデータを取得
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      // 並列でメンバーと設定を取得
      const [membersData, settingsData] = await Promise.all([
        fetchMembers(),
        fetchSettings()
      ]);
      
      setMembers(membersData);
      console.log('[App] settingsData received:', settingsData);
      if (settingsData) {
        setSettings(settingsData);
      }
      setLoading(false);
      
      // サイト全体の閲覧数カウントアップ (セッションで1回のみ)
      if (!sessionStorage.getItem('site_viewed')) {
        const result = await incrementViewCount('siteTotalViews');
        if (result && result.status === 'success') {
          sessionStorage.setItem('site_viewed', 'true');
          // 最新のカウントを反映
          setSettings(prev => ({ ...prev, siteTotalViews: result.newValue }));
        }
      }
    };
    loadData();
  }, []);

  const updateIntroText = async (newText) => {
    try {
      const result = await updateSettings('adminIntroText', newText);
      if (result.status === 'success') {
        setSettings(prev => ({ ...prev, adminIntroText: newText }));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Update intro text error:', error);
      return false;
    }
  };

  // 閲覧数を手動で更新するための関数（紹介ページ用）
  const refreshSettings = async () => {
    const data = await fetchSettings();
    if (data) setSettings(data);
  };

  const addMember = async (newMember) => {
    try {
      const result = await saveMember(newMember);
      if (result.status === 'success') {
        setMembers(prev => [...prev, result.data]);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Add member error:', error);
      alert(`保存に失敗しました: ${error.message}`);
    }
  };

  const updateMember = async (updatedMember) => {
    try {
      const result = await saveMember(updatedMember);
      if (result.status === 'success') {
        setMembers(prev => prev.map(m => String(m.id) === String(updatedMember.id) ? result.data : m));
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Update member error:', error);
      alert(`更新に失敗しました: ${error.message}`);
    }
  };

  const deleteMember = async (id) => {
    if (window.confirm('本当に削除してもよろしいですか？')) {
      try {
        await deleteMemberFromDB(id);
        setMembers(prev => prev.filter(m => String(m.id) !== String(id)));
      } catch (error) {
        alert('削除に失敗しました');
      }
    }
  };

  return (
    <Router>
      <ScrollToTop />
      <AppContent 
        members={members} 
        settings={settings} 
        loading={loading}
        onDelete={deleteMember}
        onSaveNew={addMember}
        onSaveEdit={updateMember}
        onUpdateIntro={updateIntroText}
        onRefreshSettings={refreshSettings}
      />
    </Router>
  );
}

// サブコンポーネント：Routerの内側で useLocation を使うため
function AppContent({ 
  members, settings, loading, onDelete, onSaveNew, onSaveEdit, onUpdateIntro, onRefreshSettings 
}) {
  const location = useLocation();
  const isAdminIntroPage = location.pathname === '/about-admin';

  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={loading ? <div className="loading">読み込み中...</div> : <HomePage members={members} />} />
        <Route path="/member/:id" element={<DetailPage members={members} />} />
        <Route 
          path="/admin" 
          element={<AdminPage members={members} settings={settings} onDelete={onDelete} onUpdateIntro={onUpdateIntro} />} 
        />
        <Route 
          path="/admin/new" 
          element={<AdminEditPage onSave={onSaveNew} />} 
        />
        <Route 
          path="/admin/edit/:id" 
          element={<AdminEditPage members={members} onSave={onSaveEdit} />} 
        />
        <Route path="/about-admin" element={<AdminIntroPage settings={settings} onRefresh={onRefreshSettings} />} />
      </Routes>

      {/* フッター（閲覧数表示） */}
      <Footer 
        siteViews={settings.siteTotalViews} 
        adminViews={settings.adminIntroViews} 
        showAdminViews={isAdminIntroPage} 
      />

      {/* 右下のフローティングロゴ */}
      <Link 
        to="/about-admin" 
        className="floating-footer-logo"
      >
        <img src="/footer-logo.png" alt="Creative Studio" />
      </Link>
    </div>
  );
}

export default App;
