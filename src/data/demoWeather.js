import { normalizeForecast } from '../core/weather.js';

export const DEFAULT_LOCATION = {
  id: '3435910',
  name: 'Buenos Aires',
  admin1: 'Buenos Aires F.D.',
  country: 'Argentina',
  countryCode: 'AR',
  latitude: -34.6037,
  longitude: -58.3816,
  timezone: 'America/Argentina/Buenos_Aires',
};

const base = new Date();
base.setMinutes(0, 0, 0);
const isoHour = (offset) => new Date(base.getTime() + offset * 3600000).toISOString().slice(0, 16);
const isoDay = (offset) => {
  const d = new Date(base);
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
};

const hourlyTime = Array.from({ length: 48 }, (_, index) => isoHour(index));
const dailyTime = Array.from({ length: 7 }, (_, index) => isoDay(index));

const DEMO_PAYLOAD = {
  timezone: 'America/Argentina/Buenos_Aires',
  timezone_abbreviation: 'ART',
  utc_offset_seconds: -10800,
  current: {
    time: isoHour(0),
    temperature_2m: 17.4,
    relative_humidity_2m: 68,
    apparent_temperature: 16.5,
    is_day: 1,
    precipitation: 0,
    rain: 0,
    showers: 0,
    snowfall: 0,
    weather_code: 2,
    cloud_cover: 47,
    surface_pressure: 1017.6,
    wind_speed_10m: 16.2,
    wind_direction_10m: 98,
    wind_gusts_10m: 27.7,
    visibility: 24000,
  },
  hourly: {
    time: hourlyTime,
    temperature_2m: hourlyTime.map((_, i) => 17 + Math.sin(i / 4) * 4),
    apparent_temperature: hourlyTime.map((_, i) => 16 + Math.sin(i / 4) * 4),
    precipitation_probability: hourlyTime.map((_, i) => [4, 6, 8, 10, 13, 16, 20, 17][i % 8]),
    weather_code: hourlyTime.map((_, i) => (i % 9 === 0 ? 3 : i % 4 === 0 ? 1 : 2)),
    relative_humidity_2m: hourlyTime.map((_, i) => 65 + (i % 7)),
    wind_speed_10m: hourlyTime.map((_, i) => 12 + (i % 6)),
  },
  daily: {
    time: dailyTime,
    weather_code: [2, 1, 3, 61, 2, 0, 1],
    temperature_2m_max: [21, 22, 19, 17, 20, 23, 24],
    temperature_2m_min: [13, 14, 12, 11, 12, 14, 15],
    apparent_temperature_max: [20, 21, 18, 15, 19, 22, 23],
    apparent_temperature_min: [12, 13, 11, 9, 11, 13, 14],
    sunrise: dailyTime.map((date, i) => `${date}T07:${String(20 - i).padStart(2, '0')}`),
    sunset: dailyTime.map((date, i) => `${date}T18:${String(14 + i).padStart(2, '0')}`),
    precipitation_sum: [0, 0, 0.3, 7.6, 0.8, 0, 0],
    precipitation_probability_max: [14, 9, 25, 73, 31, 8, 6],
    wind_speed_10m_max: [21, 17, 26, 30, 18, 15, 16],
    wind_gusts_10m_max: [34, 29, 42, 48, 31, 25, 27],
    uv_index_max: [4.2, 4.7, 2.8, 1.9, 3.6, 4.9, 5.1],
  },
};

export function getDemoForecast(location = DEFAULT_LOCATION) {
  return normalizeForecast(DEMO_PAYLOAD, location, 'demo');
}
