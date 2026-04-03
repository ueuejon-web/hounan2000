/**
 * 豊南中2000年卒ポータル - APIサービス
 * Google Apps Script (GAS) との通信を担当します
 */

// Vercelプロキシ（api/proxy.js）の相対パス
const GAS_WEBAPP_URL = '/api/proxy';

/**
 * GoogleドライブのURLを埋め込みに適したサムネイル形式に変換
 */
const convertToThumbnailUrl = (url) => {
  if (!url || typeof url !== 'string') return url;
  if (!url.includes('drive.google.com') && !url.includes('googleusercontent.com')) return url;

  // 各種形式からIDを抽出 (uc?id=, d/ID, /open?id= 等)
  const idMatch = url.match(/[-\w]{25,}/);
  if (idMatch) {
    const fileId = idMatch[0];
    // 埋め込みに最も安定しているサムネイル生成URLに変換 (サイズ1000px指定)
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
  }
  return url;
};

/**
 * メンバー一覧を取得
 */
export const fetchMembers = async () => {
  try {
    const response = await fetch(GAS_WEBAPP_URL);
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();

    // データの正規化: どんな項目名(Images, image, images等)でも画像を見つけ出す & URL変換
    return data.map(m => {
      // 全てのキーを小文字に正規化したクローンを作成
      const norm = {};
      Object.keys(m).forEach(k => {
        norm[k.toLowerCase().trim()] = m[k];
      });

      let finalImages = [];
      const imagesRaw = norm.images || norm.image;

      if (Array.isArray(imagesRaw)) {
        finalImages = imagesRaw;
      } else if (typeof imagesRaw === 'string' && imagesRaw.trim()) {
        finalImages = imagesRaw.split(',').map(s => s.trim()).filter(Boolean);
      }

      // すべての画像を安定した形式に変換
      const updatedImages = finalImages.map(img => convertToThumbnailUrl(img));

      return {
        ...m,
        id: String(norm.id || m.id),
        images: updatedImages
      };
    });
  } catch (error) {
    console.error('Fetch members error:', error);
    return [];
  }
};

/**
 * メンバーの追加または更新
 */
export const saveMember = async (memberData) => {
  try {
    // 自前のVercelプロキシを叩くため、標準的なJSON通信が可能です
    const response = await fetch(GAS_WEBAPP_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'save',
        data: memberData
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server responded with ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Save member error detail:', error);
    throw new Error('データの保存中にエラーが発生しました。Vercelプロキシの動作を確認してください。');
  }
};

/**
 * メンバーの削除
 */
export const deleteMemberFromDB = async (id) => {
  try {
    const response = await fetch(GAS_WEBAPP_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'delete',
        id: id
      }),
    });
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Delete member error:', error);
    throw error;
  }
};

/**
 * 設定情報の取得 (紹介文、表示カウントなど)
 */
export const fetchSettings = async () => {
  try {
    console.log('[API] Fetching settings via POST (action: getSettings)');
    const response = await fetch(GAS_WEBAPP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'getSettings' }),
    });
    
    if (!response.ok) throw new Error(`Settings fetch failed: ${response.status}`);
    const data = await response.json();
    console.log('[API] Settings data received:', data);
    return data;
  } catch (error) {
    console.error('[API] Fetch settings error:', error);
    return null;
  }
};

/**
 * 設定値の更新 (主に紹介文用)
 */
export const updateSettings = async (key, value) => {
  try {
    const response = await fetch(GAS_WEBAPP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'updateSetting',
        key,
        value
      }),
    });
    return await response.json();
  } catch (error) {
    console.error('Update setting error:', error);
    throw error;
  }
};

/**
 * 閲覧数のカウントアップ
 */
export const incrementViewCount = async (key) => {
  try {
    const response = await fetch(GAS_WEBAPP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'incrementView',
        key
      }),
    });
    return await response.json();
  } catch (error) {
    console.error('Increment view error:', error);
    return null; // カウントアップ失敗は致命的でないため
  }
};
