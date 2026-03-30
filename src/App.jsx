import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import DetailPage from './pages/DetailPage';
import AdminPage from './pages/AdminPage';
import AdminEditPage from './pages/AdminEditPage';
import AdminIntroPage from './pages/AdminIntroPage';
import { mockMembers } from './data/mockMembers';
import './App.css';
import { Link } from 'react-router-dom';

function App() {
  // 初回のみmockMembersから読み込み、以降はStateで管理
  const [members, setMembers] = useState(() => {
    const saved = localStorage.getItem('honan_members');
    let data = saved ? JSON.parse(saved) : mockMembers;
    
    // データマイグレーション: image(文字列)をimages(配列)に変換
    return data.map(m => {
      if (m.image && !m.images) {
        return { ...m, images: [m.image], image: undefined };
      }
      if (!m.images) {
        return { ...m, images: [] };
      }
      return m;
    });
  });

  // membersが更新されたらlocalStorageに保存
  useEffect(() => {
    localStorage.setItem('honan_members', JSON.stringify(members));
  }, [members]);

  const addMember = (newMember) => {
    setMembers(prev => [...prev, { ...newMember, id: Date.now(), created_at: new Date().toISOString() }]);
  };

  const updateMember = (updatedMember) => {
    setMembers(prev => prev.map(m => m.id === updatedMember.id ? updatedMember : m));
  };

  const deleteMember = (id) => {
    if (window.confirm('本当に削除してもよろしいですか？')) {
      setMembers(prev => prev.filter(m => m.id !== id));
    }
  };

  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<HomePage members={members} />} />
          <Route path="/member/:id" element={<DetailPage members={members} />} />
          <Route 
            path="/admin" 
            element={<AdminPage members={members} onDelete={deleteMember} />} 
          />
          <Route 
            path="/admin/new" 
            element={<AdminEditPage onSave={addMember} />} 
          />
          <Route 
            path="/admin/edit/:id" 
            element={<AdminEditPage members={members} onSave={updateMember} />} 
          />
          <Route path="/about-admin" element={<AdminIntroPage />} />
        </Routes>

        {/* 右下のフローティングロゴ */}
        <Link 
          to="/about-admin" 
          className="floating-footer-logo"
        >
          <img src="/footer-logo.png" alt="Creative Studio" />
        </Link>
      </div>
    </Router>
  );
}

export default App;
