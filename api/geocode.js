import { searchGeoapify } from '../server/providers.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed.' });
  try {
    const results = await searchGeoapify(req.query.q, {
      apiKey: process.env.GEOAPIFY_API_KEY,
      lang: req.query.lang,
      limit: req.query.limit,
    });
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800');
    return res.status(200).json({ results });
  } catch (error) {
    const status = error.code === 'GEOAPIFY_NOT_CONFIGURED' ? 503 : (error.status || 502);
    return res.status(status).json({ error: error.message || 'Location provider request failed.' });
  }
}
