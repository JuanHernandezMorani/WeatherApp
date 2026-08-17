const KMH_TO_MPH = 0.621371;
const MM_TO_IN = 0.0393701;
const KM_TO_MI = 0.621371;

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
  66: { label: 'Light freezing rain', icon: 'sleet' },
  67: { label: 'Freezing rain', icon: 'sleet' },
  71: { label: 'Light snow', icon: 'snow' },
  73: { label: 'Snow', icon: 'snow' },
  75: { label: 'Heavy snow', icon: 'heavy-snow' },
  77: { label: 'Snow grains', icon: 'snow' },
  80: { label: 'Light rain showers', icon: 'showers' },
  81: { label: 'Rain showers', icon: 'showers' },
  82: { label: 'Heavy rain showers', icon: 'heavy-rain' },
  85: { label: 'Light snow showers', icon: 'snow' },
  86: { label: 'Heavy snow showers', icon: 'heavy-snow' },
  95: { label: 'Thunderstorm', icon: 'thunderstorm' },
  96: { label: 'Thunderstorm with light hail', icon: 'thunderstorm' },
  99: { label: 'Thunderstorm with hail', icon: 'thunderstorm' },
};

export function getWeatherMeta(code) {
  return WEATHER_CODES[Number(code)] ?? { label: 'Weather unavailable', icon: 'cloudy' };
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
    timezone: location.timezone ?? 'auto',
  };
}

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
  if (!payload?.current || !payload?.daily || !payload?.hourly) {
    throw new Error('Forecast response is incomplete.');
  }

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
      rain: payload.current.rain,
      showers: payload.current.showers,
      snowfall: payload.current.snowfall,
      weatherCode: payload.current.weather_code,
      cloudCover: payload.current.cloud_cover,
      pressure: payload.current.surface_pressure,
      windSpeed: payload.current.wind_speed_10m,
      windDirection: payload.current.wind_direction_10m,
      windGusts: payload.current.wind_gusts_10m,
      visibility: payload.current.visibility,
      isDay: payload.current.is_day === 1,
    },
    hourly: sliceUpcomingHours(payload.hourly, payload.current.time, 24),
    daily,
  };
}
