// =============================================
// api/refill/status.js — Cek status refill
// =============================================
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const apiId  = process.env.FAYU_API_ID;
  const apiKey = process.env.FAYU_API_KEY;

  if (!apiId || !apiKey) {
    return res.status(200).json({ status: false, message: 'API credentials tidak dikonfigurasi.' });
  }

  const { refill } = req.body || {};

  if (!refill) {
    return res.status(200).json({ status: false, message: 'ID Refill wajib diisi.' });
  }

  try {
    const response = await fetch('https://fayupedia.id/api/refill/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ api_id: apiId, api_key: apiKey, refill: String(refill) })
    });

    if (!response.ok) {
      return res.status(200).json({ status: false, message: `Provider error: HTTP ${response.status}` });
    }

    const result = await response.json();
    const data   = result.data || result;

    return res.status(200).json({
      status:    true,
      refill_id: data.refill || data.id || refill,
      state:     data.status || data.state || 'Tidak diketahui',
      raw:       data
    });

  } catch (err) {
    return res.status(200).json({ status: false, message: `Server error: ${err.message}` });
  }
}
