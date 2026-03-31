/**
 * Vercel Serverless Function Proxy for Google Apps Script
 */
export default async function handler(req, res) {
  // 以前のGASウェブアプリURL (最新版)
  const GAS_URL = 'https://script.google.com/macros/s/AKfycbwifR2bvqrXFB5tPi1WXY6JUR81kSg28PK-CcmLEMrT4tLM6lwgrKuV2HOktiBjxTI6wA/exec';

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
    const data = await response.json();

    // GASからのレスポンスをそのまま返す
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Proxy failed', message: error.message });
  }
}
