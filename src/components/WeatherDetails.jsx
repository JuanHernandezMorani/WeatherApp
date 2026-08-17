import React from 'react';
import { degreesToCompass, formatPrecipitation, formatTemperature, formatWind } from '../core/weather.js';

const Detail = ({ label, value, hint }) => <div className="detail-card"><span>{label}</span><strong>{value}</strong>{hint && <small>{hint}</small>}</div>;

export default function WeatherDetails({ forecast, unit }) {
  const c = forecast.current;
  const today = forecast.daily[0] ?? {};
  return (
    <section className="panel" aria-labelledby="details-heading">
      <div className="section-heading"><div><p className="eyebrow">Conditions</p><h2 id="details-heading">Weather details</h2></div></div>
      <div className="details-grid">
        <Detail label="Humidity" value={Number.isFinite(Number(c.humidity)) ? `${Math.round(c.humidity)}%` : '—'} />
        <Detail label="Wind" value={formatWind(c.windSpeed, unit)} hint={`${degreesToCompass(c.windDirection)} · gusts ${formatWind(c.windGusts, unit)}`} />
        <Detail label="Pressure" value={Number.isFinite(Number(c.pressure)) ? `${Math.round(c.pressure)} hPa` : '—'} />
        <Detail label="Dew point" value={formatTemperature(c.dewPoint, unit)} hint={Number.isFinite(Number(c.fogCoverage)) ? `Fog coverage ${Math.round(c.fogCoverage)}%` : undefined} />
        <Detail label="Cloud cover" value={Number.isFinite(Number(c.cloudCover)) ? `${Math.round(c.cloudCover)}%` : '—'} />
        <Detail label="Precipitation" value={formatPrecipitation(c.precipitation, unit)} hint={`${Math.round(today.precipitationProbability ?? 0)}% daily chance`} />
        <Detail label="UV index" value={Number.isFinite(Number(today.uvIndexMax ?? c.uvIndex)) ? Number(today.uvIndexMax ?? c.uvIndex).toFixed(1) : '—'} hint="Clear-sky daily maximum" />
        <Detail label="Timezone" value={forecast.timezoneAbbreviation || forecast.timezone || 'Local'} />
      </div>
    </section>
  );
}
