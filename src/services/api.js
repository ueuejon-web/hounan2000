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
    // CORS Preflightを避けるため、あえてContent-Typeを設定せず、
    // プレーンテキストとしてJSONを送ります。GAS側はこれを受け取れます。
    const response = await fetch(GAS_WEBAPP_URL, {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      redirect: 'follow', // 重要: GASのリダイレクトに追従
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
    // CORSエラーが起きている可能性があるため、より親切なエラーを投げる
    throw new Error('データの保存中にエラーが発生しました。GAS側の設定（Anyoneアクセス等）を再確認してください。');
  }
};

/**
 * メンバーの削除
 */
export const deleteMemberFromDB = async (id) => {
  try {
    const response = await fetch(GAS_WEBAPP_URL, {
      method: 'POST',
      mode: 'cors',
      redirect: 'follow',
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
