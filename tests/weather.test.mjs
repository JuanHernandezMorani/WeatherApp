import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildLocationLabel,
  celsiusToFahrenheit,
  degreesToCompass,
  formatLocalTime,
  formatPrecipitation,
  formatTemperature,
  getWeatherMeta,
  normalizeForecast,
  sliceUpcomingHours,
} from '../src/core/weather.js';
import { DEFAULT_LOCATION, getDemoForecast } from '../src/data/demoWeather.js';

test('maps representative WMO weather codes', () => {
  assert.equal(getWeatherMeta(0).label, 'Clear sky');
  assert.equal(getWeatherMeta(63).icon, 'rain');
  assert.equal(getWeatherMeta(95).icon, 'thunderstorm');
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

test('normalization rejects incomplete forecast payloads', () => {
  assert.throws(() => normalizeForecast({}, DEFAULT_LOCATION), /incomplete/i);
});

test('formats provider-local clock strings without shifting them into the browser timezone', () => {
  const rendered = formatLocalTime('2026-08-16T21:30');
  assert.match(rendered, /9:30|21:30/);
});
