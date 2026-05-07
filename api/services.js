export default async function handler(req, res) {
  const apiId = process.env.FAYU_API_ID;
  const apiKey = process.env.FAYU_API_KEY;

  // Validasi env
  if (!apiId || !apiKey) {
    return res.status(200).json({
      status: false,
      message: "API credentials belum dikonfigurasi di environment variables."
    });
  }

  try {
    const response = await fetch("https://fayupedia.id/api/services", {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ api_id: apiId, api_key: apiKey })
    });

    if (!response.ok) {
      return res.status(200).json({
        status: false,
        message: `Server API error: HTTP ${response.status}`
      });
    }

    const result = await response.json();

    // Ambil array produk dari berbagai kemungkinan struktur response
    let rawProducts = null;
    if (Array.isArray(result))               rawProducts = result;
    else if (Array.isArray(result.data))     rawProducts = result.data;
    else if (Array.isArray(result.services)) rawProducts = result.services;

    if (!rawProducts || rawProducts.length === 0) {
      const debugInfo = JSON.stringify(result).substring(0, 300);
      return res.status(200).json({
        status: false,
        message: `Produk kosong atau struktur tidak dikenali. Debug: ${debugInfo}`
      });
    }

    // ✅ FIX UTAMA: field "name" harus konsisten untuk script.js
    const formatted = rawProducts.map(item => ({
      id:          item.service || item.id || item.service_id || '',
      name:        item.name || item.service || item.service_name || 'Layanan',  // ← pakai "name"
      category:    item.category || item.type || 'Layanan',
      price:       (parseInt(item.price || item.rate || item.harga || 0)) + 500,
      min:         parseInt(item.min || item.min_order || 0),
      max:         parseInt(item.max || item.max_order || 0),
      refill:      item.refill || item.refill_available || 0,
      description: item.description || item.desc || '',
    }));

    return res.status(200).json({
      status: true,
      total: formatted.length,
      data: formatted
    });

  } catch (error) {
    return res.status(200).json({
      status: false,
      message: `Server crash: ${error.message}`
    });
  }
}
