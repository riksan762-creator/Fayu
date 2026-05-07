// =============================================
// api/order.js — Proses order ke provider
// =============================================
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ status: false, message: 'Method not allowed.' });
  }

  const apiId  = process.env.FAYU_API_ID;
  const apiKey = process.env.FAYU_API_KEY;

  if (!apiId || !apiKey) {
    return res.status(200).json({ status: false, message: 'API credentials tidak dikonfigurasi.' });
  }

  const { service, link, quantity } = req.body;

  // Validasi input
  if (!service || !link || !quantity) {
    return res.status(200).json({ status: false, message: 'Data tidak lengkap: service, link, quantity wajib diisi.' });
  }

  if (isNaN(parseInt(quantity)) || parseInt(quantity) <= 0) {
    return res.status(200).json({ status: false, message: 'Jumlah order tidak valid.' });
  }

  if (!link.startsWith('http') && !link.includes('.')) {
    return res.status(200).json({ status: false, message: 'Link/username tidak valid.' });
  }

  try {
    const response = await fetch('https://fayupedia.id/api/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        api_id:   apiId,
        api_key:  apiKey,
        service:  String(service),
        link:     link,
        quantity: String(quantity)
      })
    });

    if (!response.ok) {
      return res.status(200).json({ status: false, message: `Provider error: HTTP ${response.status}` });
    }

    const result = await response.json();

    // Normalisasi response sukses dari berbagai format provider
    const isSuccess = result.order || result.id || result.order_id || result.status === true;

    if (isSuccess) {
      return res.status(200).json({
        status: true,
        order:  result.order || result.id || result.order_id,
        message: 'Order berhasil diproses.',
        raw:    result
      });
    } else {
      const errMsg = result.error || result.message || result.msg || 'Order ditolak oleh provider.';
      return res.status(200).json({ status: false, message: errMsg });
    }

  } catch (err) {
    return res.status(200).json({ status: false, message: `Server error: ${err.message}` });
  }
}
