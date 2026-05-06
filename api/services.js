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

    // Debugging: Jika status false, kirim pesan error aslinya ke frontend
    if (result.status) {
      // Tambah margin profit Rp 500
      const dataWithProfit = result.data.map(item => ({
        ...item,
        price: parseInt(item.price) + 500
      }));
      res.status(200).json({ status: true, data: dataWithProfit });
    } else {
      // Jika API menolak, kita akan tahu alasannya di sini
      res.status(400).json({ status: false, message: result.data || "API Reject" });
    }
  } catch (error) {
    res.status(500).json({ status: false, message: "Koneksi ke Fayu Gagal" });
  }
}
