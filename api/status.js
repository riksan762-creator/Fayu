export default async function handler(req, res) {
  const { id } = req.body;
  try {
    const response = await fetch("https://fayupedia.id/api/status", {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ 
        'api_id': process.env.FAYU_API_ID, 
        'api_key': process.env.FAYU_API_KEY, 
        'id': id 
      })
    });
    const data = await response.json();
    res.status(200).json(data);
  } catch (e) { res.status(500).json({ status: false }); }
}
