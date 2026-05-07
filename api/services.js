export default async function handler(req, res) {
  const apiId = process.env.FAYU_API_ID;
  const apiKey = process.env.FAYU_API_KEY;

  if (!apiId || !apiKey) {
    return res.status(200).json({ status: false, message: "API ID/Key belum diset di Vercel Settings" });
  }

  try {
    const response = await fetch("https://fayupedia.id/api/services", {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ 'api_id': apiId, 'api_key': apiKey })
    });

    const result = await response.json();

    if (result.status && Array.isArray(result.data)) {
      // Ambil 100 produk teratas dulu saja untuk tes awal agar ringan
      const limitedData = result.data.slice(0, 200).map(item => ({
        id: item.id,
        category: item.category,
        service: item.service,
        price: (parseInt(item.price) || 0) + 500, // Keuntungan SawargiPay
        status: item.status
      }));
      
      return res.status(200).json({ status: true, data: limitedData });
    } else {
      return res.status(200).json({ status: false, message: result.data || "Data tidak valid" });
    }
  } catch (error) {
    return res.status(200).json({ status: false, message: "Gangguan Server Pusat: " + error.message });
  }
}
