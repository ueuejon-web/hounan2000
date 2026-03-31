import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import DetailPage from './pages/DetailPage';
import AdminPage from './pages/AdminPage';
import AdminEditPage from './pages/AdminEditPage';
import AdminIntroPage from './pages/AdminIntroPage';
import { fetchMembers, saveMember, deleteMemberFromDB } from './services/api.js';
import './App.css';
import { Link } from 'react-router-dom';

function App() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // 起動時にGASからデータを取得
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const data = await fetchMembers();
      setMembers(data);
      setLoading(false);
    };
    loadData();
  }, []);

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
      alert('保存に失敗しました');
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
      alert('更新に失敗しました');
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
      <div className="app-container">
        <Routes>
          <Route path="/" element={loading ? <div className="loading">読み込み中...</div> : <HomePage members={members} />} />
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
