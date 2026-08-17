import React from 'react';
import WeatherIcon from './WeatherIcon.jsx';
import { formatDay, formatLocalDate, formatPrecipitation, formatTemperature, formatWind, getWeatherMeta } from '../core/weather.js';

export default function DailyForecast({ days, unit }) {
  return (
    <section className="panel" aria-labelledby="daily-heading">
      <div className="section-heading"><div><p className="eyebrow">7-day outlook</p><h2 id="daily-heading">Daily forecast</h2></div></div>
      <div className="daily-list">
        {days.map((day, index) => {
          const meta = getWeatherMeta(day.weatherCode);
          return (
            <article className="day-row" key={day.date}>
              <div className="day-name"><strong>{formatDay(day.date, index)}</strong><span>{formatLocalDate(day.date, { month: 'short', day: 'numeric' })}</span></div>
              <div className="day-condition"><WeatherIcon code={day.weatherCode} size="xs"/><span>{meta.label}</span></div>
              <div className="day-rain"><span>{Math.round(day.precipitationProbability ?? 0)}%</span><small>{formatPrecipitation(day.precipitationSum, unit)}</small></div>
              <div className="day-wind"><span>{formatWind(day.windSpeedMax, unit)}</span></div>
              <div className="day-temp"><strong>{formatTemperature(day.maxTemperature, unit)}</strong><span>{formatTemperature(day.minTemperature, unit)}</span></div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
