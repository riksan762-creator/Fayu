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
    
    // LOGIKA DETEKSI OTOMATIS:
    // Kita cari dimana letak array produknya (apakah di result, result.data, atau result.message)
    let rawProducts = [];
    if (Array.isArray(result)) {
        rawProducts = result;
    } else if (result.data && Array.isArray(result.data)) {
        rawProducts = result.data;
    } else if (result.message && Array.isArray(result.message)) {
        rawProducts = result.message;
    }

    if (rawProducts.length > 0) {
      const formatted = rawProducts.slice(0, 500).map(item => ({
        id: item.id || item.service_id || "0",
        category: item.category || "General",
        service: item.service || item.name || "Layanan Tanpa Nama",
        // Ambil harga (price/rate) dan tambah untung Rp 500
        price: (parseInt(item.price || item.rate || 0)) + 500
      }));
      
      return res.status(200).json({ status: true, data: formatted });
    } else {
      // Jika masih gagal, kita kirim isi asli dari pusat ke log untuk dipelajari
      console.log("Respon asli pusat:", JSON.stringify(result));
      return res.status(200).json({ 
        status: false, 
        message: "Format data pusat berubah. Cek Log Vercel untuk detail." 
      });
    }
  } catch (error) {
    return res.status(200).json({ status: false, message: "Kesalahan sistem: " + error.message });
  }
}
