export default async function handler(req, res) {
  const apiId = process.env.FAYU_API_ID;
  const apiKey = process.env.FAYU_API_KEY;
  try {
    const response = await fetch("https://fayupedia.id/api/balance", {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ 'api_id': apiId, 'api_key': apiKey })
    });
    const data = await response.json();
    res.status(200).json(data);
  } catch (e) { res.status(500).json({ status: false }); }
}
