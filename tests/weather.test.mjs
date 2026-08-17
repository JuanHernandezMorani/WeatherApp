import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildLocationLabel,
  calculateApparentTemperature,
  celsiusToFahrenheit,
  degreesToCompass,
  formatLocalTime,
  formatPrecipitation,
  formatTemperature,
  getWeatherMeta,
  mapMetSymbolToCode,
  normalizeForecast,
  normalizeMetForecast,
  sliceUpcomingHours,
} from '../src/core/weather.js';
import { calculateSunTimes } from '../src/core/solar.js';
import { DEFAULT_LOCATION, getDemoForecast } from '../src/data/demoWeather.js';
import { mapGeoapifyLocation } from '../server/providers.js';

function metFixture(hours = 30) {
  const start = Date.UTC(2026, 7, 16, 12, 0, 0);
  return {
    properties: {
      meta: { updated_at: '2026-08-16T11:30:00Z' },
      timeseries: Array.from({ length: hours }, (_, index) => {
        const hour = new Date(start + index * 3600000).toISOString();
        const night = index % 24 < 8 || index % 24 > 20;
        return {
          time: hour,
          data: {
            instant: {
              details: {
                air_pressure_at_sea_level: 1015 + (index % 3),
                air_temperature: 12 + Math.sin(index / 4) * 5,
                cloud_area_fraction: 20 + (index % 50),
                dew_point_temperature: 7,
                fog_area_fraction: 0,
                relative_humidity: 65,
                ultraviolet_index_clear_sky: night ? 0 : 4.2,
                wind_from_direction: 90,
                wind_speed: 4,
                wind_speed_of_gust: 7,
              },
            },
            next_1_hours: {
              summary: { symbol_code: night ? 'clearsky_night' : 'partlycloudy_day' },
              details: {
                precipitation_amount: index % 8 === 0 ? 0.3 : 0,
                probability_of_precipitation: index % 8 === 0 ? 30 : 5,
              },
            },
          },
        };
      }),
    },
  };
}

test('maps representative weather codes', () => {
  assert.equal(getWeatherMeta(0).label, 'Clear sky');
  assert.equal(getWeatherMeta(63).icon, 'rain');
  assert.equal(getWeatherMeta(95).icon, 'thunderstorm');
});

test('maps MET Norway symbols into the UI weather taxonomy', () => {
  assert.equal(mapMetSymbolToCode('clearsky_night'), 0);
  assert.equal(mapMetSymbolToCode('partlycloudy_day'), 2);
  assert.equal(mapMetSymbolToCode('heavyrainshowersandthunder_day'), 95);
  assert.equal(mapMetSymbolToCode('heavysnow'), 75);
});

test('converts Celsius to Fahrenheit', () => {
  assert.equal(celsiusToFahrenheit(0), 32);
  assert.equal(celsiusToFahrenheit(100), 212);
});

test('formats temperatures in both units', () => {
  assert.equal(formatTemperature(20, 'C'), '20°');
  assert.equal(formatTemperature(20, 'F'), '68°');
});

test('formats imperial precipitation locally', () => {
  assert.equal(formatPrecipitation(25.4, 'F'), '1.00 in');
});

test('converts wind direction into compass labels', () => {
  assert.equal(degreesToCompass(0), 'N');
  assert.equal(degreesToCompass(90), 'E');
  assert.equal(degreesToCompass(225), 'SW');
});

test('builds concise location labels without duplicates', () => {
  assert.equal(buildLocationLabel({ name: 'Paris', admin1: 'Île-de-France', country: 'France' }), 'Paris, Île-de-France, France');
  assert.equal(buildLocationLabel({ name: 'Monaco', admin1: 'Monaco', country: 'Monaco' }), 'Monaco');
});

test('maps Geoapify city results into the application location shape', () => {
  const location = mapGeoapifyLocation({
    place_id: 'abc', city: 'Mar del Plata', state: 'Buenos Aires', country: 'Argentina', country_code: 'ar',
    lat: -38.0, lon: -57.55, timezone: { name: 'America/Argentina/Buenos_Aires' },
  });
  assert.equal(location.name, 'Mar del Plata');
  assert.equal(location.admin1, 'Buenos Aires');
  assert.equal(location.countryCode, 'AR');
  assert.equal(location.timezone, 'America/Argentina/Buenos_Aires');
});

test('normalizes a MET Norway forecast into the dashboard model', () => {
  const forecast = normalizeMetForecast(metFixture(), {
    id: 'test', name: 'Test City', admin1: 'Test State', country: 'Argentina',
    latitude: -34.6, longitude: -58.4, timezone: 'UTC',
  });
  assert.equal(forecast.provider, 'met-no');
  assert.equal(forecast.location.name, 'Test City');
  assert.equal(forecast.hourly.length, 24);
  assert.ok(forecast.daily.length >= 2);
  assert.equal(forecast.current.weatherCode, 0);
  assert.ok(Number.isFinite(forecast.current.apparentTemperature));
  assert.ok(Number.isFinite(forecast.daily[0].maxTemperature));
});

test('apparent-temperature calculation returns a finite derived value', () => {
  assert.ok(Number.isFinite(calculateApparentTemperature(25, 60, 3)));
});

test('solar calculator returns sunrise and sunset for Buenos Aires', () => {
  const result = calculateSunTimes('2026-08-16', -34.6037, -58.3816);
  assert.match(result.sunrise, /^2026-08-16T/);
  assert.match(result.sunset, /^2026-08-16T/);
});

test('demo forecast is complete and explicitly marked demo', () => {
  const forecast = getDemoForecast();
  assert.equal(forecast.source, 'demo');
  assert.equal(forecast.location.name, 'Buenos Aires');
  assert.equal(forecast.daily.length, 7);
  assert.equal(forecast.hourly.length, 24);
});

test('upcoming hourly slicing respects requested count', () => {
  const hourly = {
    time: ['2026-08-16T10:00', '2026-08-16T11:00', '2026-08-16T12:00', '2026-08-16T13:00'],
    temperature_2m: [10, 11, 12, 13],
    apparent_temperature: [9, 10, 11, 12],
    precipitation_probability: [0, 5, 10, 15],
    weather_code: [0, 1, 2, 3],
    relative_humidity_2m: [70, 69, 68, 67],
    wind_speed_10m: [5, 6, 7, 8],
  };
  const result = sliceUpcomingHours(hourly, '2026-08-16T11:15', 2);
  assert.equal(result.length, 2);
  assert.equal(result[0].time, '2026-08-16T11:00');
});

test('demo normalization rejects incomplete forecast payloads', () => {
  assert.throws(() => normalizeForecast({}, DEFAULT_LOCATION), /incomplete/i);
});

test('formats provider-local clock strings without browser-timezone shifts', () => {
  const rendered = formatLocalTime('2026-08-16T21:30');
  assert.match(rendered, /9:30|21:30/);
});
