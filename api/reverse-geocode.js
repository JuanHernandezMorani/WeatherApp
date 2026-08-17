import { reverseGeoapify } from '../server/providers.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed.' });
  try {
    const location = await reverseGeoapify(req.query.lat, req.query.lon, {
      apiKey: process.env.GEOAPIFY_API_KEY,
      lang: req.query.lang,
    });
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800');
    return res.status(200).json({ location });
  } catch (error) {
    const status = error.code === 'GEOAPIFY_NOT_CONFIGURED' ? 503 : (error.status || 502);
    return res.status(status).json({ error: error.message || 'Reverse geocoding failed.' });
  }
}
