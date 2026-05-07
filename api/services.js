// =============================================
// api/services.js — Ambil daftar layanan
// =============================================
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const apiId  = process.env.FAYU_API_ID;
  const apiKey = process.env.FAYU_API_KEY;

  if (!apiId || !apiKey) {
    return res.status(200).json({
      status: false,
      message: 'API credentials belum dikonfigurasi di Vercel environment variables.'
    });
  }

  try {
    const response = await fetch('https://fayupedia.id/api/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ api_id: apiId, api_key: apiKey })
    });

    if (!response.ok) {
      return res.status(200).json({ status: false, message: `HTTP Error: ${response.status}` });
    }

    const result = await response.json();

    // Deteksi struktur response dari berbagai provider
    let raw = null;
    if (Array.isArray(result))               raw = result;
    else if (Array.isArray(result.data))     raw = result.data;
    else if (Array.isArray(result.services)) raw = result.services;

    if (!raw || raw.length === 0) {
      return res.status(200).json({
        status: false,
        message: `Produk tidak ditemukan. Response: ${JSON.stringify(result).substring(0, 200)}`
      });
    }

    const formatted = raw.map(item => ({
      id:          String(item.service || item.id || item.service_id || ''),
      name:        item.name || item.service || item.service_name || 'Layanan',
      category:    item.category || item.type || 'Layanan',
      price:       Math.ceil(parseFloat(item.price || item.rate || item.harga || 0)) + 500,
      min:         parseInt(item.min  || item.min_order  || 0),
      max:         parseInt(item.max  || item.max_order  || 0),
      refill:      item.refill || 0,
      description: item.description || item.desc || '',
    }));

    return res.status(200).json({
      status: true,
      total: formatted.length,
      data: formatted
    });

  } catch (err) {
    return res.status(200).json({ status: false, message: `Server error: ${err.message}` });
  }
}
