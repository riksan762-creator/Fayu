// =============================================
// api/status.js — Cek status pesanan
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
    const response = await fetch('https://fayupedia.id/api/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ api_id: apiId, api_key: apiKey, order: String(order) })
    });

    if (!response.ok) {
      return res.status(200).json({ status: false, message: `Provider error: HTTP ${response.status}` });
    }

    const result = await response.json();

    // Normalisasi field dari berbagai format response
    const data = result.data || result;
    return res.status(200).json({
      status:    true,
      order_id:  data.order   || data.id     || order,
      charge:    data.charge  || data.cost   || 0,
      start_count: data.start_count || data.start || 0,
      remains:   data.remains || data.remain || 0,
      quantity:  data.quantity || data.qty   || 0,
      service:   data.service || '',
      state:     normalizeState(data.status  || data.state || ''),
      raw:       data
    });

  } catch (err) {
    return res.status(200).json({ status: false, message: `Server error: ${err.message}` });
  }
}

function normalizeState(s) {
  const map = {
    pending:    'Menunggu',
    processing: 'Diproses',
    inprogress: 'Berjalan',
    in_progress:'Berjalan',
    completed:  'Selesai',
    partial:    'Sebagian',
    canceled:   'Dibatalkan',
    cancelled:  'Dibatalkan',
    refunded:   'Direfund',
  };
  return map[String(s).toLowerCase()] || s || 'Tidak diketahui';
}
