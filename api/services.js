export default async function handler(req, res) {
  const apiId = process.env.FAYU_API_ID;
  const apiKey = process.env.FAYU_API_KEY;

  try {
    const response = await fetch("https://fayupedia.id/api/services", {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ 'api_id': apiId, 'api_key': apiKey })
    });

    const result = await response.json();
    
    // CEK APAKAH ADA ARRAY DI DALAM RESPON
    let rawProducts = result.data || result.message || (Array.isArray(result) ? result : null);

    if (rawProducts && Array.isArray(rawProducts)) {
      const formatted = rawProducts.slice(0, 300).map(item => ({
        id: item.id || item.service_id,
        category: item.category || "Layanan",
        service: item.service || item.name,
        price: (parseInt(item.price || item.rate || 0)) + 500
      }));
      return res.status(200).json({ status: true, data: formatted });
    } else {
      // JIKA GAGAL, KIRIM PESAN ASLI DARI PUSAT KE FRONTEND
      // Ini akan membantu kita melihat apakah pesannya "API Key Salah" atau "Saldo Tidak Cukup"
      const errorMsg = typeof result.data === 'string' ? result.data : JSON.stringify(result);
      return res.status(200).json({ 
        status: false, 
        message: "Respon Pusat: " + errorMsg 
      });
    }
  } catch (error) {
    return res.status(200).json({ status: false, message: "Crash: " + error.message });
  }
}
