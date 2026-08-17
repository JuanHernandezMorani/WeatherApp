import React from 'react';
import { getWeatherMeta } from '../core/weather.js';

function Sun({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r="11" fill="currentColor" opacity="0.95" />
      <g stroke="currentColor" strokeWidth="4" strokeLinecap="round">
        <path d="M32 5v8M32 51v8M5 32h8M51 32h8M13 13l6 6M45 45l6 6M51 13l-6 6M19 45l-6 6" />
      </g>
    </svg>
  );
}

function Cloud({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
      <path d="M18 48h31a10 10 0 0 0 1-20 16 16 0 0 0-30-4A12 12 0 0 0 18 48Z" fill="currentColor" />
    </svg>
  );
}

export default function WeatherIcon({ code, isDay = true, size = 'md', label }) {
  const meta = getWeatherMeta(code);
  const className = `weather-icon weather-icon-${size} weather-icon-${meta.icon} ${isDay ? 'is-day' : 'is-night'}`;

  const rainLines = (
    <g stroke="currentColor" strokeWidth="3" strokeLinecap="round">
      <path d="M20 48l-3 7M31 48l-3 7M42 48l-3 7" />
    </g>
  );

  let graphic;
  if (meta.icon === 'clear') {
    graphic = isDay ? <Sun className={className} /> : (
      <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
        <path d="M43 47A21 21 0 0 1 26 14a21 21 0 1 0 17 33Z" fill="currentColor" />
      </svg>
    );
  } else if (['rain', 'heavy-rain', 'showers', 'drizzle', 'sleet'].includes(meta.icon)) {
    graphic = (
      <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
        <path d="M17 41h31a9 9 0 0 0 1-18 15 15 0 0 0-28-3A11 11 0 0 0 17 41Z" fill="currentColor" opacity="0.92" />
        {rainLines}
      </svg>
    );
  } else if (['snow', 'heavy-snow'].includes(meta.icon)) {
    graphic = (
      <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
        <path d="M17 38h31a9 9 0 0 0 1-18 15 15 0 0 0-28-3A11 11 0 0 0 17 38Z" fill="currentColor" opacity="0.92" />
        <g fill="currentColor"><circle cx="20" cy="50" r="2" /><circle cx="32" cy="54" r="2" /><circle cx="44" cy="49" r="2" /></g>
      </svg>
    );
  } else if (meta.icon === 'thunderstorm') {
    graphic = (
      <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
        <path d="M17 38h31a9 9 0 0 0 1-18 15 15 0 0 0-28-3A11 11 0 0 0 17 38Z" fill="currentColor" opacity="0.92" />
        <path d="M34 37 25 51h8l-3 10 12-17h-8Z" fill="currentColor" />
      </svg>
    );
  } else if (meta.icon === 'fog') {
    graphic = (
      <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
        <path d="M16 33h34a9 9 0 0 0 0-18 15 15 0 0 0-27-2A11 11 0 0 0 16 33Z" fill="currentColor" opacity="0.8" />
        <g stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M12 43h40M18 51h34M12 59h31" /></g>
      </svg>
    );
  } else if (['mostly-clear', 'partly-cloudy'].includes(meta.icon)) {
    graphic = (
      <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="24" cy="23" r="10" fill="currentColor" opacity="0.55" />
        <path d="M18 49h31a10 10 0 0 0 1-20 16 16 0 0 0-30-4A12 12 0 0 0 18 49Z" fill="currentColor" />
      </svg>
    );
  } else {
    graphic = <Cloud className={className} />;
  }

  return (
    <span className="weather-icon-wrap" role={label ? 'img' : undefined} aria-label={label || undefined}>
      {graphic}
    </span>
  );
}
