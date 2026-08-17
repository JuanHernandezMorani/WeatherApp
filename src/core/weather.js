import { calculateSunTimes } from './solar.js';

const KMH_TO_MPH = 0.621371;
const MM_TO_IN = 0.0393701;
const KM_TO_MI = 0.621371;
const MS_TO_KMH = 3.6;

export const WEATHER_CODES = {
  0: { label: 'Clear sky', icon: 'clear' },
  1: { label: 'Mainly clear', icon: 'mostly-clear' },
  2: { label: 'Partly cloudy', icon: 'partly-cloudy' },
  3: { label: 'Overcast', icon: 'cloudy' },
  45: { label: 'Fog', icon: 'fog' },
  48: { label: 'Depositing rime fog', icon: 'fog' },
  51: { label: 'Light drizzle', icon: 'drizzle' },
  53: { label: 'Drizzle', icon: 'drizzle' },
  55: { label: 'Heavy drizzle', icon: 'drizzle' },
  56: { label: 'Light freezing drizzle', icon: 'sleet' },
  57: { label: 'Freezing drizzle', icon: 'sleet' },
  61: { label: 'Light rain', icon: 'rain' },
  63: { label: 'Rain', icon: 'rain' },
  65: { label: 'Heavy rain', icon: 'heavy-rain' },
  66: { label: 'Sleet', icon: 'sleet' },
  67: { label: 'Heavy sleet', icon: 'sleet' },
  71: { label: 'Light snow', icon: 'snow' },
  73: { label: 'Snow', icon: 'snow' },
  75: { label: 'Heavy snow', icon: 'heavy-snow' },
  77: { label: 'Snow grains', icon: 'snow' },
  80: { label: 'Rain showers', icon: 'showers' },
  81: { label: 'Rain showers', icon: 'showers' },
  82: { label: 'Heavy rain showers', icon: 'heavy-rain' },
  85: { label: 'Snow showers', icon: 'snow' },
  86: { label: 'Heavy snow showers', icon: 'heavy-snow' },
  95: { label: 'Thunderstorm', icon: 'thunderstorm' },
  96: { label: 'Thunderstorm with hail', icon: 'thunderstorm' },
  99: { label: 'Thunderstorm with hail', icon: 'thunderstorm' },
};

export function getWeatherMeta(code) {
  return WEATHER_CODES[Number(code)] ?? { label: 'Weather unavailable', icon: 'cloudy' };
}

export function mapMetSymbolToCode(symbolCode = '') {
  const symbol = String(symbolCode).toLowerCase().replace(/_(day|night|polartwilight)$/i, '');
  if (!symbol) return 3;
  if (symbol.includes('thunder')) return 95;
  if (symbol.includes('fog')) return 45;
  if (symbol.includes('snow')) return symbol.includes('heavy') ? 75 : symbol.includes('shower') ? 85 : 71;
  if (symbol.includes('sleet')) return symbol.includes('heavy') ? 67 : 66;
  if (symbol.includes('rainshower')) return symbol.includes('heavy') ? 82 : 80;
  if (symbol.includes('rain')) return symbol.includes('heavy') ? 65 : 61;
  if (symbol.includes('partlycloudy')) return 2;
  if (symbol.includes('cloudy')) return 3;
  if (symbol.includes('fair')) return 1;
  if (symbol.includes('clearsky')) return 0;
  return 3;
}

export function celsiusToFahrenheit(value) {
  return Number(value) * 9 / 5 + 32;
}

export function fahrenheitToCelsius(value) {
  return (Number(value) - 32) * 5 / 9;
}

export function formatTemperature(value, unit = 'C', digits = 0) {
  if (!Number.isFinite(Number(value))) return '—';
  const output = unit === 'F' ? celsiusToFahrenheit(value) : Number(value);
  return `${output.toFixed(digits)}°`;
}

export function formatWind(value, unit = 'C') {
  if (!Number.isFinite(Number(value))) return '—';
  const output = unit === 'F' ? Number(value) * KMH_TO_MPH : Number(value);
  return `${Math.round(output)} ${unit === 'F' ? 'mph' : 'km/h'}`;
}

export function formatPrecipitation(value, unit = 'C') {
  if (!Number.isFinite(Number(value))) return '—';
  const output = unit === 'F' ? Number(value) * MM_TO_IN : Number(value);
  return unit === 'F' ? `${output.toFixed(2)} in` : `${output.toFixed(1)} mm`;
}

export function formatVisibility(valueMeters, unit = 'C') {
  if (!Number.isFinite(Number(valueMeters))) return '—';
  const km = Number(valueMeters) / 1000;
  return unit === 'F' ? `${(km * KM_TO_MI).toFixed(1)} mi` : `${km.toFixed(1)} km`;
}

export function degreesToCompass(degrees) {
  if (!Number.isFinite(Number(degrees))) return '—';
  const labels = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return labels[Math.round(((Number(degrees) % 360) / 45)) % 8];
}

function parseForecastLocalIso(isoString) {
  if (!isoString) return null;
  const match = String(isoString).match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/);
  if (!match) return null;
  const [, year, month, day, hour = '00', minute = '00'] = match;
  return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute)));
}

export function formatLocalTime(isoString, options = {}) {
  const date = parseForecastLocalIso(isoString);
  if (!date || Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat(undefined, {
    timeZone: 'UTC',
    hour: 'numeric',
    minute: options.includeMinutes === false ? undefined : '2-digit',
    ...options,
  }).format(date);
}

export function formatLocalDate(isoString, options = {}) {
  const date = parseForecastLocalIso(isoString);
  if (!date || Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat(undefined, { timeZone: 'UTC', ...options }).format(date);
}

export function formatDay(isoDate, index = 0) {
  if (!isoDate) return '—';
  if (index === 0) return 'Today';
  return formatLocalDate(isoDate, { weekday: 'short' });
}

export function buildLocationLabel(location) {
  if (!location) return 'Unknown location';
  const pieces = [location.name, location.admin1, location.country].filter(Boolean);
  return [...new Set(pieces)].join(', ');
}

export function normalizeLocation(location) {
  return {
    id: String(location.id ?? `${location.latitude},${location.longitude}`),
    name: location.name ?? 'Selected location',
    admin1: location.admin1 ?? '',
    country: location.country ?? '',
    countryCode: location.country_code ?? location.countryCode ?? '',
    latitude: Number(location.latitude),
    longitude: Number(location.longitude),
    timezone: location.timezone ?? 'UTC',
  };
}

export function calculateApparentTemperature(temperature, humidity, windSpeedMs) {
  const t = Number(temperature);
  const rh = Number(humidity);
  const wind = Number(windSpeedMs);
  if (![t, rh, wind].every(Number.isFinite)) return t;
  const vaporPressure = (rh / 100) * 6.105 * Math.exp((17.27 * t) / (237.7 + t));
  return t + (0.33 * vaporPressure) - (0.7 * wind) - 4;
}

function safeTimezone(timezone) {
  try {
    new Intl.DateTimeFormat('en', { timeZone: timezone }).format(new Date());
    return timezone;
  } catch {
    return 'UTC';
  }
}

function partsAt(isoString, timezone) {
  const date = new Date(isoString);
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: safeTimezone(timezone),
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(date);
  return Object.fromEntries(parts.filter((part) => part.type !== 'literal').map((part) => [part.type, part.value]));
}

export function toLocalWallClock(isoString, timezone) {
  const p = partsAt(isoString, timezone);
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
}

function localDayKey(isoString, timezone) {
  const p = partsAt(isoString, timezone);
  return `${p.year}-${p.month}-${p.day}`;
}

function localHour(isoString, timezone) {
  return Number(partsAt(isoString, timezone).hour);
}

function timezoneAbbreviation(timezone, instant = new Date()) {
  try {
    return new Intl.DateTimeFormat('en', { timeZone: safeTimezone(timezone), timeZoneName: 'short' })
      .formatToParts(instant)
      .find((part) => part.type === 'timeZoneName')?.value || timezone;
  } catch {
    return timezone;
  }
}

function metPeriod(entry, stepHours = 1) {
  const data = entry?.data ?? {};
  if (data.next_1_hours) return data.next_1_hours;
  if (stepHours >= 5 && data.next_6_hours) return data.next_6_hours;
  return data.next_6_hours || data.next_12_hours || null;
}

function metSymbol(entry) {
  const data = entry?.data ?? {};
  return data.next_1_hours?.summary?.symbol_code ||
    data.next_6_hours?.summary?.symbol_code ||
    data.next_12_hours?.summary?.symbol_code || '';
}

function numberList(values) {
  return values.map(Number).filter(Number.isFinite);
}

function maxOrNull(values) {
  const nums = numberList(values);
  return nums.length ? Math.max(...nums) : null;
}

function minOrNull(values) {
  const nums = numberList(values);
  return nums.length ? Math.min(...nums) : null;
}

function sumNumbers(values) {
  return numberList(values).reduce((sum, value) => sum + value, 0);
}

function chooseDailySymbol(entries, timezone) {
  let best = entries[0];
  let bestDistance = Infinity;
  for (const entry of entries) {
    const distance = Math.abs(localHour(entry.time, timezone) - 12);
    if (distance < bestDistance && metSymbol(entry)) {
      best = entry;
      bestDistance = distance;
    }
  }
  return mapMetSymbolToCode(metSymbol(best));
}

export function normalizeMetForecast(payload, location, source = 'live') {
  const series = payload?.properties?.timeseries;
  if (!Array.isArray(series) || series.length === 0) throw new Error('MET Norway forecast response is incomplete.');

  const normalizedLocation = normalizeLocation(location);
  const timezone = safeTimezone(normalizedLocation.timezone);
  const currentEntry = series[0];
  const currentDetails = currentEntry.data?.instant?.details ?? {};
  const firstPeriod = metPeriod(currentEntry, 1);
  const currentSymbol = metSymbol(currentEntry);
  const currentWindMs = Number(currentDetails.wind_speed);

  const hourly = series.slice(0, 24).map((entry, index) => {
    const details = entry.data?.instant?.details ?? {};
    const next = series[index + 1];
    const stepHours = next ? Math.max(1, (new Date(next.time) - new Date(entry.time)) / 3600000) : 1;
    const period = metPeriod(entry, stepHours);
    return {
      time: toLocalWallClock(entry.time, timezone),
      temperature: details.air_temperature,
      apparentTemperature: calculateApparentTemperature(details.air_temperature, details.relative_humidity, details.wind_speed),
      precipitationProbability: period?.details?.probability_of_precipitation ?? 0,
      weatherCode: mapMetSymbolToCode(metSymbol(entry)),
      humidity: details.relative_humidity,
      windSpeed: Number(details.wind_speed) * MS_TO_KMH,
    };
  });

  const grouped = new Map();
  series.forEach((entry, index) => {
    const key = localDayKey(entry.time, timezone);
    const next = series[index + 1];
    const stepHours = next ? Math.max(1, (new Date(next.time) - new Date(entry.time)) / 3600000) : 1;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push({ entry, stepHours });
  });

  const daily = [...grouped.entries()].slice(0, 7).map(([date, items]) => {
    const entries = items.map((item) => item.entry);
    const details = entries.map((entry) => entry.data?.instant?.details ?? {});
    const periods = items.map(({ entry, stepHours }) => metPeriod(entry, stepHours));
    const temperatures = details.map((item) => item.air_temperature);
    const apparent = details.map((item) => calculateApparentTemperature(item.air_temperature, item.relative_humidity, item.wind_speed));
    const sun = calculateSunTimes(date, normalizedLocation.latitude, normalizedLocation.longitude);
    return {
      date,
      weatherCode: chooseDailySymbol(entries, timezone),
      maxTemperature: maxOrNull(temperatures),
      minTemperature: minOrNull(temperatures),
      maxFeelsLike: maxOrNull(apparent),
      minFeelsLike: minOrNull(apparent),
      sunrise: sun.sunrise ? toLocalWallClock(sun.sunrise, timezone) : null,
      sunset: sun.sunset ? toLocalWallClock(sun.sunset, timezone) : null,
      precipitationSum: sumNumbers(periods.map((period) => period?.details?.precipitation_amount)),
      precipitationProbability: maxOrNull(periods.map((period) => period?.details?.probability_of_precipitation)) ?? 0,
      windSpeedMax: maxOrNull(details.map((item) => Number(item.wind_speed) * MS_TO_KMH)),
      windGustMax: maxOrNull(details.map((item) => Number(item.wind_speed_of_gust) * MS_TO_KMH)),
      uvIndexMax: maxOrNull(details.map((item) => item.ultraviolet_index_clear_sky)),
    };
  });

  const isDay = currentSymbol.includes('_night') ? false : currentSymbol.includes('_day') ? true : true;

  return {
    source,
    provider: 'met-no',
    fetchedAt: new Date().toISOString(),
    providerUpdatedAt: payload.properties?.meta?.updated_at ?? null,
    timezone,
    timezoneAbbreviation: timezoneAbbreviation(timezone, new Date(currentEntry.time)),
    location: { ...normalizedLocation, timezone },
    current: {
      time: toLocalWallClock(currentEntry.time, timezone),
      temperature: currentDetails.air_temperature,
      apparentTemperature: calculateApparentTemperature(currentDetails.air_temperature, currentDetails.relative_humidity, currentWindMs),
      humidity: currentDetails.relative_humidity,
      precipitation: firstPeriod?.details?.precipitation_amount ?? 0,
      weatherCode: mapMetSymbolToCode(currentSymbol),
      cloudCover: currentDetails.cloud_area_fraction,
      pressure: currentDetails.air_pressure_at_sea_level,
      windSpeed: currentWindMs * MS_TO_KMH,
      windDirection: currentDetails.wind_from_direction,
      windGusts: Number.isFinite(Number(currentDetails.wind_speed_of_gust)) ? Number(currentDetails.wind_speed_of_gust) * MS_TO_KMH : currentWindMs * MS_TO_KMH,
      dewPoint: currentDetails.dew_point_temperature,
      fogCoverage: currentDetails.fog_area_fraction,
      uvIndex: currentDetails.ultraviolet_index_clear_sky,
      isDay,
    },
    hourly,
    daily,
  };
}

// Normalizer for the bundled deterministic demo fixture.
export function sliceUpcomingHours(hourly, nowIso, count = 12) {
  if (!hourly?.time?.length) return [];
  const now = new Date(nowIso ?? Date.now()).getTime();
  let start = hourly.time.findIndex((time) => new Date(time).getTime() >= now - 30 * 60 * 1000);
  if (start < 0) start = 0;
  return hourly.time.slice(start, start + count).map((time, offset) => {
    const index = start + offset;
    return {
      time,
      temperature: hourly.temperature_2m?.[index],
      apparentTemperature: hourly.apparent_temperature?.[index],
      precipitationProbability: hourly.precipitation_probability?.[index],
      weatherCode: hourly.weather_code?.[index],
      humidity: hourly.relative_humidity_2m?.[index],
      windSpeed: hourly.wind_speed_10m?.[index],
    };
  });
}

export function normalizeForecast(payload, location, source = 'live') {
  if (!payload?.current || !payload?.daily || !payload?.hourly) throw new Error('Forecast response is incomplete.');
  const daily = payload.daily.time.map((date, index) => ({
    date,
    weatherCode: payload.daily.weather_code?.[index],
    maxTemperature: payload.daily.temperature_2m_max?.[index],
    minTemperature: payload.daily.temperature_2m_min?.[index],
    maxFeelsLike: payload.daily.apparent_temperature_max?.[index],
    minFeelsLike: payload.daily.apparent_temperature_min?.[index],
    sunrise: payload.daily.sunrise?.[index],
    sunset: payload.daily.sunset?.[index],
    precipitationSum: payload.daily.precipitation_sum?.[index],
    precipitationProbability: payload.daily.precipitation_probability_max?.[index],
    windSpeedMax: payload.daily.wind_speed_10m_max?.[index],
    windGustMax: payload.daily.wind_gusts_10m_max?.[index],
    uvIndexMax: payload.daily.uv_index_max?.[index],
  }));
  return {
    source,
    provider: source === 'demo' ? 'demo' : 'legacy',
    fetchedAt: new Date().toISOString(),
    timezone: payload.timezone,
    timezoneAbbreviation: payload.timezone_abbreviation,
    utcOffsetSeconds: payload.utc_offset_seconds,
    location: normalizeLocation(location),
    current: {
      time: payload.current.time,
      temperature: payload.current.temperature_2m,
      apparentTemperature: payload.current.apparent_temperature,
      humidity: payload.current.relative_humidity_2m,
      precipitation: payload.current.precipitation,
      weatherCode: payload.current.weather_code,
      cloudCover: payload.current.cloud_cover,
      pressure: payload.current.surface_pressure,
      windSpeed: payload.current.wind_speed_10m,
      windDirection: payload.current.wind_direction_10m,
      windGusts: payload.current.wind_gusts_10m,
      visibility: payload.current.visibility,
      dewPoint: null,
      fogCoverage: null,
      uvIndex: payload.daily.uv_index_max?.[0],
      isDay: payload.current.is_day === 1,
    },
    hourly: sliceUpcomingHours(payload.hourly, payload.current.time, 24),
    daily,
  };
}
