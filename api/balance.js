export default async function handler(req, res) {
  try {
    const response = await fetch("https://fayupedia.id/api/balance", {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        'api_id': process.env.FAYU_API_ID,
        'api_key': process.env.FAYU_API_KEY
      })
    });

    const result = await response.json();
    
    // Kita cek semua kemungkinan nama kolom saldo
    let saldoAktif = 0;
    if (result.data) {
        saldoAktif = result.data.balance || result.data.saldo || result.data.balance_amount || 0;
    }

    res.status(200).json({ 
      status: result.status, 
      balance: saldoAktif 
    });
  } catch (e) {
    res.status(200).json({ status: false, balance: 0 });
  }
}
