import React from 'react';
import WeatherIcon from './WeatherIcon.jsx';
import { formatLocalTime, formatTemperature } from '../core/weather.js';

export default function HourlyForecast({ hours, unit }) {
  return (
    <section className="panel" aria-labelledby="hourly-heading">
      <div className="section-heading"><div><p className="eyebrow">Next 24 hours</p><h2 id="hourly-heading">Hourly forecast</h2></div><span className="scroll-hint">Scroll →</span></div>
      <div className="hourly-scroll">
        {hours.map((hour, index) => (
          <article className="hour-card" key={hour.time}>
            <time>{index === 0 ? 'Now' : formatLocalTime(hour.time, { includeMinutes: false })}</time>
            <WeatherIcon code={hour.weatherCode} size="sm" />
            <strong>{formatTemperature(hour.temperature, unit)}</strong>
            <span className="rain-chance">{Math.round(hour.precipitationProbability ?? 0)}%</span>
          </article>
        ))}
      </div>
    </section>
  );
}
