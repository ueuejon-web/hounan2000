/**
 * 豊南中2000年卒ポータル - APIサービス
 * Google Apps Script (GAS) との通信を担当します
 */

// GASをデプロイした後に発行されるウェブアプリのURLをここに貼り付けてください
const GAS_WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbw0JPbirxWlf652efjAq6I5jaLbJzeXMYh8v6eQdRCtBW9gn10vuxdDG3_kVx31rifGQw/exec';

/**
 * メンバー一覧を取得
 */
export const fetchMembers = async () => {
  try {
    const response = await fetch(GAS_WEBAPP_URL);
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();

    // データの正規化: images が文字列で来た場合に配列に変換する
    return data.map(m => ({
      ...m,
      id: Number(m.id), // IDを数値に確実に変換
      images: Array.isArray(m.images)
        ? m.images
        : (typeof m.images === 'string' ? m.images.split(',').filter(Boolean) : [])
    }));
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
    const response = await fetch(GAS_WEBAPP_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: 'save',
        data: memberData
      }),
    });
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Save member error:', error);
    throw error;
  }
};

/**
 * メンバーの削除
 */
export const deleteMemberFromDB = async (id) => {
  try {
    const response = await fetch(GAS_WEBAPP_URL, {
      method: 'POST',
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
