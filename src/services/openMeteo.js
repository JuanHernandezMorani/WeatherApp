import { normalizeForecast, normalizeLocation } from '../core/weather.js';

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

export async function searchLocations(query, { signal, count = 7 } = {}) {
  const trimmed = query.trim();
  if (trimmed.length < 3) return [];

  const url = new URL(GEOCODING_URL);
  url.searchParams.set('name', trimmed);
  url.searchParams.set('count', String(count));
  url.searchParams.set('language', (navigator.language || 'en').split('-')[0].toLowerCase());
  url.searchParams.set('format', 'json');

  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`Location search failed (${response.status}).`);
  const data = await response.json();
  if (data.error) throw new Error(data.reason || 'Location search failed.');
  return (data.results ?? []).map(normalizeLocation);
}

export async function fetchForecast(location, { signal } = {}) {
  const url = new URL(FORECAST_URL);
  url.searchParams.set('latitude', String(location.latitude));
  url.searchParams.set('longitude', String(location.longitude));
  url.searchParams.set('timezone', 'auto');
  url.searchParams.set('forecast_days', '7');
  url.searchParams.set('current', [
    'temperature_2m',
    'relative_humidity_2m',
    'apparent_temperature',
    'is_day',
    'precipitation',
    'rain',
    'showers',
    'snowfall',
    'weather_code',
    'cloud_cover',
    'surface_pressure',
    'wind_speed_10m',
    'wind_direction_10m',
    'wind_gusts_10m',
    'visibility',
  ].join(','));
  url.searchParams.set('hourly', [
    'temperature_2m',
    'apparent_temperature',
    'precipitation_probability',
    'weather_code',
    'relative_humidity_2m',
    'wind_speed_10m',
  ].join(','));
  url.searchParams.set('daily', [
    'weather_code',
    'temperature_2m_max',
    'temperature_2m_min',
    'apparent_temperature_max',
    'apparent_temperature_min',
    'sunrise',
    'sunset',
    'precipitation_sum',
    'precipitation_probability_max',
    'wind_speed_10m_max',
    'wind_gusts_10m_max',
    'uv_index_max',
  ].join(','));

  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`Weather request failed (${response.status}).`);
  const data = await response.json();
  if (data.error) throw new Error(data.reason || 'Weather request failed.');
  return normalizeForecast(data, location, 'live');
}
