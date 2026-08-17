import { fetchMetForecast } from '../server/providers.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed.' });
  try {
    const data = await fetchMetForecast(req.query.lat, req.query.lon, {
      userAgent: process.env.MET_USER_AGENT,
    });
    res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=1800');
    return res.status(200).json(data);
  } catch (error) {
    return res.status(error.status || 502).json({ error: error.message || 'Weather provider request failed.' });
  }
}
