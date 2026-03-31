/**
 * Vercel Serverless Function Proxy for Google Apps Script
 */
export default async function handler(req, res) {
  // 以前のGASウェブアプリURL (最新版)
  const GAS_URL = 'https://script.google.com/macros/s/AKfycbwr-TOtZJ6TuSyPqfqUykW9-25N9BlKd52g4nH83vl99jZlWTWtl0TvC1NPoDOAgOgkkQ/exec';

  try {
    // GASへの転送設定
    const url = new URL(GAS_URL);
    
    // クエリパラメータがあれば追加 (doGet用)
    if (req.method === 'GET') {
      Object.keys(req.query).forEach(key => url.searchParams.append(key, req.query[key]));
    }

    const fetchOptions = {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
      },
      // POST時はボディを転送
      body: req.method === 'POST' ? (typeof req.body === 'string' ? req.body : JSON.stringify(req.body)) : undefined,
      redirect: 'follow',
    };

    const response = await fetch(url.toString(), fetchOptions);
    
    // Googleからの生の情報を取得
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      // JSONでない場合（HTMLエラーなど）はテキストとして返す
      data = { status: 'non-json', message: text };
    }

    res.status(response.status).json(data);
  } catch (error) {
    console.error('Proxy internal error:', error);
    res.status(500).json({ status: 'proxy-error', message: error.message, stack: error.stack });
  }
}
