import React, { useState, useMemo } from 'react';
import Header from '../components/Header';
import Concept from '../components/Concept';
import Search from '../components/Search';
import Sidebar from '../components/Sidebar';
import MemberCard from '../components/MemberCard';
import './HomePage.css';

const HomePage = ({ members = [] }) => {
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('全て');

  const filteredMembers = useMemo(() => {
    return members.filter(member => {
       // keyword matching
      const content = `${member.name} ${member.job} ${member.short_desc}`.toLowerCase();
      const matchKeyword = keyword === '' || content.includes(keyword.toLowerCase());
      
      // category matching
      const matchCategory = category === '全て' || member.category === category ||
        (category === '美容・健康' && member.category === '美容') ||
        (category === '建築・お庭' && member.category === '建築') ||
        (category === '教育・習い事' && member.category === '教育');
      
      return matchKeyword && matchCategory;
    }).reverse();
  }, [keyword, category, members]);

  return (
    <div className="home-page">
      <Header />
      <main className="main-content">
        <Concept />
        <Search keyword={keyword} onSearch={setKeyword} />
        
        <div className="home-layout container">
          <div className="layout-left">
            <Sidebar selectedCategory={category} onSelectCategory={setCategory} />
          </div>
          
          <div className="layout-center">
            {filteredMembers.length > 0 ? (
              <div className="member-list">
                {filteredMembers.map(member => (
                  <MemberCard key={member.id} member={member} />
                ))}
              </div>
            ) : (
              <p className="no-result">条件に一致するメンバーが見つかりません。</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
