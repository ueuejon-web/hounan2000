import React from 'react';
import './Sidebar.css';

const categories = [
  '全て', 'IT', '車・バイク', '医療', '教育', '飲食', '遊び', '美容', '建築', 'その他'
];

const Sidebar = ({ selectedCategory, onSelectCategory }) => {
  return (
    <aside className="sidebar">
      <h3 className="sidebar-title">カテゴリー</h3>
      <ul className="category-list">
        {categories.map(cat => (
          <li key={cat}>
            <button
              className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => onSelectCategory(cat)}
            >
              {cat}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;
