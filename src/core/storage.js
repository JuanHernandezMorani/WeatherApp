const PREFIX = 'weather-app-v2:';

export function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(`${PREFIX}${key}`);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function writeStorage(key, value) {
  try {
    localStorage.setItem(`${PREFIX}${key}`, JSON.stringify(value));
  } catch {
    // Storage may be unavailable in private/restricted contexts.
  }
}

export function cacheForecast(forecast) {
  if (!forecast?.location) return;
  const key = `forecast:${forecast.location.latitude.toFixed(3)},${forecast.location.longitude.toFixed(3)}`;
  writeStorage(key, forecast);
}

export function readCachedForecast(location, maxAgeMs = 30 * 60 * 1000) {
  if (!location) return null;
  const key = `forecast:${Number(location.latitude).toFixed(3)},${Number(location.longitude).toFixed(3)}`;
  const cached = readStorage(key, null);
  if (!cached?.fetchedAt) return null;
  const age = Date.now() - new Date(cached.fetchedAt).getTime();
  if (!Number.isFinite(age) || age > maxAgeMs) return null;
  return { ...cached, source: 'cache' };
}
