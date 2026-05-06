export default async function handler(req, res) {
  const apiId = process.env.FAYU_API_ID;
  const apiKey = process.env.FAYU_API_KEY;

  try {
    const response = await fetch("https://fayupedia.id/api/services", {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        'api_id': apiId,
        'api_key': apiKey
      })
    });

    const result = await response.json();

    // Cek apakah result.data benar-benar ada sebelum diproses
    if (result.status && Array.isArray(result.data)) {
      const dataWithProfit = result.data.map(item => ({
        ...item,
        price: parseInt(item.price || 0) + 500
      }));
      return res.status(200).json({ status: true, data: dataWithProfit });
    } else {
      // Kirim error dari pusat agar tidak crash
      return res.status(200).json({ status: false, message: result.data || "Data produk kosong" });
    }
  } catch (error) {
    return res.status(500).json({ status: false, message: "Server Crash: " + error.message });
  }
}
