import { normalizeLocation, normalizeMetForecast } from '../core/weather.js';

function languageCode() {
  return (navigator.language || 'en').split('-')[0].toLowerCase();
}

async function fetchApi(url, { signal } = {}) {
  const response = await fetch(url, { signal });
  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }
  if (!response.ok) throw new Error(payload?.error || `Request failed (${response.status}).`);
  return payload;
}

export async function searchLocations(query, { signal, count = 7 } = {}) {
  const trimmed = String(query ?? '').trim();
  if (trimmed.length < 3) return [];
  const url = new URL('/api/geocode', window.location.origin);
  url.searchParams.set('q', trimmed);
  url.searchParams.set('lang', languageCode());
  url.searchParams.set('limit', String(count));
  const payload = await fetchApi(url, { signal });
  return (payload.results ?? []).map(normalizeLocation);
}

export async function reverseGeocodeLocation(latitude, longitude, { signal } = {}) {
  const url = new URL('/api/reverse-geocode', window.location.origin);
  url.searchParams.set('lat', String(latitude));
  url.searchParams.set('lon', String(longitude));
  url.searchParams.set('lang', languageCode());
  const payload = await fetchApi(url, { signal });
  return normalizeLocation(payload.location);
}

export async function fetchForecast(location, { signal } = {}) {
  const url = new URL('/api/weather', window.location.origin);
  url.searchParams.set('lat', Number(location.latitude).toFixed(4));
  url.searchParams.set('lon', Number(location.longitude).toFixed(4));
  const payload = await fetchApi(url, { signal });
  return normalizeMetForecast(payload, location, 'live');
}
