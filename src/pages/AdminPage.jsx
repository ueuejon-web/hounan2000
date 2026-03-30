import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import './AdminPage.css';

const AdminPage = ({ members, onDelete }) => {
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
          <table className="admin-table">
            <thead>
              <tr>
                <th>画像</th>
                <th>名前</th>
                <th>職種</th>
                <th>カテゴリ</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {members.map(member => (
                <tr key={member.id}>
                  <td><img src={member.image} alt="" className="admin-thumb" /></td>
                  <td className="admin-name">{member.name}</td>
                  <td>{member.job}</td>
                  <td>{member.category}</td>
                  <td className="admin-btns">
                    <Link to={`/admin/edit/${member.id}`} className="admin-edit-link">編集</Link>
                    <button onClick={() => onDelete(member.id)} className="admin-delete-btn">削除</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default AdminPage;
