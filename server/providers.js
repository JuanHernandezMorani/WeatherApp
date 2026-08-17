const MET_ENDPOINT = 'https://api.met.no/weatherapi/locationforecast/2.0/complete';
const GEOAPIFY_AUTOCOMPLETE = 'https://api.geoapify.com/v1/geocode/autocomplete';
const GEOAPIFY_REVERSE = 'https://api.geoapify.com/v1/geocode/reverse';

function finiteCoordinate(value, min, max, name) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < min || numeric > max) {
    throw new Error(`Invalid ${name}.`);
  }
  return Math.round(numeric * 10000) / 10000;
}

function requireGeoapifyKey(key) {
  if (!key) {
    const error = new Error('Geoapify is not configured. Set GEOAPIFY_API_KEY in the server environment.');
    error.code = 'GEOAPIFY_NOT_CONFIGURED';
    throw error;
  }
  return key;
}

export function mapGeoapifyLocation(result = {}) {
  const latitude = Number(result.lat ?? result.latitude);
  const longitude = Number(result.lon ?? result.longitude);
  const fallbackName = String(result.formatted ?? '').split(',')[0].trim();
  const name = result.city || result.town || result.village || result.municipality || result.name || fallbackName || 'Selected location';

  return {
    id: String(result.place_id ?? result.datasource?.raw?.osm_id ?? `${latitude},${longitude}`),
    name,
    admin1: result.state || result.county || '',
    country: result.country || '',
    countryCode: String(result.country_code || '').toUpperCase(),
    latitude,
    longitude,
    timezone: result.timezone?.name || 'UTC',
  };
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  let payload;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message = payload?.message || payload?.error || `${response.status} ${response.statusText}`;
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }
  return payload;
}

export async function fetchMetForecast(latitude, longitude, { userAgent } = {}) {
  const lat = finiteCoordinate(latitude, -90, 90, 'latitude');
  const lon = finiteCoordinate(longitude, -180, 180, 'longitude');
  const url = new URL(MET_ENDPOINT);
  url.searchParams.set('lat', String(lat));
  url.searchParams.set('lon', String(lon));

  return fetchJson(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': userAgent || 'WeatherApp/2.1 portfolio-juanbhm-dev.vercel.app',
    },
  });
}

export async function searchGeoapify(query, { apiKey, lang = 'en', limit = 7 } = {}) {
  const key = requireGeoapifyKey(apiKey);
  const text = String(query ?? '').trim();
  if (text.length < 3) return [];

  const url = new URL(GEOAPIFY_AUTOCOMPLETE);
  url.searchParams.set('text', text);
  url.searchParams.set('type', 'city');
  url.searchParams.set('limit', String(Math.max(1, Math.min(10, Number(limit) || 7))));
  url.searchParams.set('lang', String(lang || 'en').slice(0, 2).toLowerCase());
  url.searchParams.set('format', 'json');
  url.searchParams.set('apiKey', key);

  const payload = await fetchJson(url);
  return (payload?.results ?? [])
    .map(mapGeoapifyLocation)
    .filter((item) => Number.isFinite(item.latitude) && Number.isFinite(item.longitude));
}

export async function reverseGeoapify(latitude, longitude, { apiKey, lang = 'en' } = {}) {
  const key = requireGeoapifyKey(apiKey);
  const lat = finiteCoordinate(latitude, -90, 90, 'latitude');
  const lon = finiteCoordinate(longitude, -180, 180, 'longitude');
  const url = new URL(GEOAPIFY_REVERSE);
  url.searchParams.set('lat', String(lat));
  url.searchParams.set('lon', String(lon));
  url.searchParams.set('type', 'city');
  url.searchParams.set('limit', '1');
  url.searchParams.set('lang', String(lang || 'en').slice(0, 2).toLowerCase());
  url.searchParams.set('format', 'json');
  url.searchParams.set('apiKey', key);

  const payload = await fetchJson(url);
  const first = payload?.results?.[0];
  if (!first) {
    const error = new Error('No place name was found for these coordinates.');
    error.status = 404;
    throw error;
  }
  return mapGeoapifyLocation(first);
}
