export default async function handler(req, res) {
  const apiId = process.env.FAYU_API_ID;
  const apiKey = process.env.FAYU_API_KEY;

  try {
    // Memberikan batas waktu tunggu agar tidak timeout di Vercel
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch("https://fayupedia.id/api/services", {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        'api_id': apiId,
        'api_key': apiKey
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    const result = await response.json();

    // Pastikan data yang diterima adalah Array sebelum diproses
    if (result && result.data && Array.isArray(result.data)) {
      const dataWithProfit = result.data.map(item => ({
        id: item.id,
        category: item.category,
        service: item.service,
        // Menambahkan margin 500 dan memastikan harga adalah angka
        price: (parseInt(item.price) || 0) + 500,
        status: item.status
      }));
      
      return res.status(200).json({ status: true, data: dataWithProfit });
    } else {
      return res.status(200).json({ status: false, message: "Pusat mengirim data kosong" });
    }
  } catch (error) {
    console.error("Log Error CTO:", error.message);
    return res.status(200).json({ status: false, message: "Gagal memproses ribuan data produk" });
  }
}
