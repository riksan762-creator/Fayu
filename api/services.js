export default async function handler(req, res) {
  try {
    const response = await fetch("https://fayupedia.id/api/services", {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        'api_id': process.env.FAYU_API_ID,
        'api_key': process.env.FAYU_API_KEY
      })
    });

    const result = await response.json();

    // Jika result.data bukan array, kita bungkus biar tidak error
    const rawData = Array.isArray(result.data) ? result.data : [];
    
    if (rawData.length > 0) {
      const formatted = rawData.slice(0, 300).map(item => ({
        id: item.id || item.service_id,
        category: item.category || "Layanan",
        service: item.service || item.name,
        price: (parseInt(item.price || item.rate) || 0) + 500
      }));
      return res.status(200).json({ status: true, data: formatted });
    }
    
    return res.status(200).json({ status: false, message: "Pusat belum mengirim data" });
  } catch (e) {
    return res.status(200).json({ status: false, message: "Gagal Parsing Data" });
  }
}
