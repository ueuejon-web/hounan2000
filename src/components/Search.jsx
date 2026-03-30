import React from 'react';
import './Search.css';

const Search = ({ keyword, onSearch }) => {
  return (
    <div className="search-section container">
      <div className="search-box">
        <input
          type="text"
          className="search-input"
          placeholder="名前や職種で検索"
          value={keyword}
          onChange={(e) => onSearch(e.target.value)}
        />
        <button className="search-btn">
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Search;
