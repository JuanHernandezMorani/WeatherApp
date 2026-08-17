import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fetchMetForecast, reverseGeoapify, searchGeoapify } from './server/providers.js';

function sendJson(res, status, payload, cacheControl) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (cacheControl) res.setHeader('Cache-Control', cacheControl);
  res.end(JSON.stringify(payload));
}

function localApiPlugin(env) {
  return {
    name: 'weather-local-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url || '/', 'http://localhost');
        if (!url.pathname.startsWith('/api/')) return next();

        try {
          if (url.pathname === '/api/weather') {
            const data = await fetchMetForecast(url.searchParams.get('lat'), url.searchParams.get('lon'), {
              userAgent: env.MET_USER_AGENT,
            });
            return sendJson(res, 200, data, 'no-store');
          }

          if (url.pathname === '/api/geocode') {
            const results = await searchGeoapify(url.searchParams.get('q'), {
              apiKey: env.GEOAPIFY_API_KEY,
              lang: url.searchParams.get('lang'),
              limit: url.searchParams.get('limit'),
            });
            return sendJson(res, 200, { results }, 'no-store');
          }

          if (url.pathname === '/api/reverse-geocode') {
            const location = await reverseGeoapify(url.searchParams.get('lat'), url.searchParams.get('lon'), {
              apiKey: env.GEOAPIFY_API_KEY,
              lang: url.searchParams.get('lang'),
            });
            return sendJson(res, 200, { location }, 'no-store');
          }

          return next();
        } catch (error) {
          const status = error.code === 'GEOAPIFY_NOT_CONFIGURED' ? 503 : (error.status || 502);
          return sendJson(res, status, { error: error.message || 'Provider request failed.' }, 'no-store');
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), localApiPlugin(env)],
  };
});
