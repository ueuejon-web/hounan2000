import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import './AdminEditPage.css';

const categories = ['IT', '車・バイク', '医療', '教育', '飲食', '遊び', '美容', '建築', 'その他'];

const AdminEditPage = ({ members = [], onSave }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    job: '',
    category: 'IT',
    short_desc: '',
    detail: '',
    images: [], // 画像配列（Base64のリスト）
    company: '',
    contact: '',
    sns_link: '',
    map_url: '' // Google Map埋め込みURL
  });

  useEffect(() => {
    if (isEdit && members.length > 0) {
      const member = members.find(m => String(m.id) === String(id));
      if (member) {
        setFormData({
          ...member,
          images: member.images || (member.image ? [member.image] : []),
          map_url: member.map_url || ''
        });
      }
    }
  }, [id, isEdit, members]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 画像をリサイズするヘルパー関数
  const resizeImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxSide = 1200; // 最大長辺

          if (width > height) {
            if (width > maxSide) {
              height *= maxSide / width;
              width = maxSide;
            }
          } else {
            if (height > maxSide) {
              width *= maxSide / height;
              height = maxSide;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // 80%の画質でJPEGとして出力して軽量化
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
      };
    });
  };

  // ファイルアップロード処理
  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    
    // 最大3枚制限
    if (formData.images.length + files.length > 3) {
      alert("画像は最大3枚までです");
      return;
    }

    const resizedImages = await Promise.all(files.map(file => resizeImage(file)));
    
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...resizedImages]
    }));
  };

  // 画像削除
  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(formData);
      navigate('/admin');
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="admin-edit-page">
      <Header />
      <main className="main-content container">
        <div className="form-card">
          <h2>{isEdit ? 'メンバー情報を編集' : '新規メンバー登録'}</h2>
          <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-group">
              <label>名前（必須）</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>職種（必須）</label>
              <input type="text" name="job" value={formData.job} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>カテゴリー</label>
              <select name="category" value={formData.category} onChange={handleChange}>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>短い説明（一覧用）</label>
              <input type="text" name="short_desc" value={formData.short_desc} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>画像（最大3枚まで）</label>
              <div className="file-input-wrapper">
                <input 
                  type="file" 
                  accept="image/*" 
                  multiple 
                  onChange={handleFileChange} 
                  disabled={formData.images.length >= 3}
                  className="file-input"
                />
                <span className="file-hint">クリックして画像を選択</span>
              </div>
              
              <div className="image-preview-list">
                {formData.images.map((img, idx) => (
                  <div key={idx} className="preview-item">
                    <img src={img} alt="preview" />
                    <button type="button" onClick={() => removeImage(idx)} className="remove-img-btn">×</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>詳細説明</label>
              <textarea name="detail" value={formData.detail} onChange={handleChange} rows="5"></textarea>
            </div>

            <div className="form-group">
              <label>Googleマップ埋め込みコード（iframeコード）</label>
              <textarea 
                name="map_url" 
                value={formData.map_url} 
                onChange={handleChange} 
                placeholder="Googleマップの『共有』→『地図を埋め込む』からコピーしたHTMLコードを貼ってください"
                rows="3"
              ></textarea>
              <p className="field-tip">※iframeタグ全体、またはsrc部分のURLを貼り付けてください</p>
            </div>

            <div className="form-group">
              <label>会社名</label>
              <input type="text" name="company" value={formData.company} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>連絡先</label>
              <input type="text" name="contact" value={formData.contact} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>SNSリンク (URL)</label>
              <input type="url" name="sns_link" value={formData.sns_link} onChange={handleChange} />
            </div>

            <div className="form-actions">
              <button type="submit" className="save-btn">保存する</button>
              <button type="button" onClick={() => navigate('/admin')} className="cancel-btn">キャンセル</button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AdminEditPage;
