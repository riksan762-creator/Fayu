// =============================================
// api/refill.js — Request refill order
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

  const { order } = req.body || {};

  if (!order) {
    return res.status(200).json({ status: false, message: 'ID Order wajib diisi.' });
  }

  try {
    const response = await fetch('https://fayupedia.id/api/refill', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ api_id: apiId, api_key: apiKey, order: String(order) })
    });

    if (!response.ok) {
      return res.status(200).json({ status: false, message: `Provider error: HTTP ${response.status}` });
    }

    const result = await response.json();
    const isSuccess = result.refill || result.id || result.status === true;

    if (isSuccess) {
      return res.status(200).json({
        status:    true,
        refill_id: result.refill || result.id || result.refill_id,
        message:   'Refill berhasil diajukan.',
        raw:       result
      });
    } else {
      return res.status(200).json({
        status:  false,
        message: result.error || result.message || 'Refill ditolak oleh provider.'
      });
    }

  } catch (err) {
    return res.status(200).json({ status: false, message: `Server error: ${err.message}` });
  }
}
