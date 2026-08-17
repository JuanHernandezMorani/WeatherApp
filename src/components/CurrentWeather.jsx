import React from 'react';
import WeatherIcon from './WeatherIcon.jsx';
import { buildLocationLabel, formatLocalDate, formatTemperature, getWeatherMeta } from '../core/weather.js';

function StarIcon({ filled }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true" className={filled ? 'filled' : ''}><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2 7.5 14 3 9.6l6.2-.9Z"/></svg>;
}

export default function CurrentWeather({ forecast, unit, isFavorite, onToggleFavorite }) {
  const current = forecast.current;
  const meta = getWeatherMeta(current.weatherCode);
  const statusLabel = forecast.source === 'demo' ? 'Demo data' : forecast.source === 'cache' ? 'Cached data' : 'Live data';
  return (
    <section className={`current-card weather-${meta.icon}`} aria-labelledby="current-location">
      <div className="current-topline">
        <div>
          <div className="status-row">
            <span className={`source-badge source-${forecast.source}`}>{statusLabel}</span>
            <span className="updated-label">Updated {new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date(forecast.fetchedAt))}</span>
          </div>
          <h1 id="current-location">{buildLocationLabel(forecast.location)}</h1>
          <p>{formatLocalDate(current.time, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
        <button className="favorite-button" type="button" onClick={onToggleFavorite} aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'} title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}>
          <StarIcon filled={isFavorite} />
        </button>
      </div>

      <div className="current-main">
        <div className="current-temperature">
          <WeatherIcon code={current.weatherCode} isDay={current.isDay} size="xl" label={meta.label} />
          <div><strong>{formatTemperature(current.temperature, unit)}</strong><span>{meta.label}</span></div>
        </div>
        <div className="current-summary">
          <p>Feels like <strong>{formatTemperature(current.apparentTemperature, unit)}</strong></p>
          <p>High <strong>{formatTemperature(forecast.daily[0]?.maxTemperature, unit)}</strong> · Low <strong>{formatTemperature(forecast.daily[0]?.minTemperature, unit)}</strong></p>
        </div>
      </div>
    </section>
  );
}
