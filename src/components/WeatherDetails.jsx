import React from 'react';
import { degreesToCompass, formatPrecipitation, formatVisibility, formatWind } from '../core/weather.js';

const Detail = ({ label, value, hint }) => <div className="detail-card"><span>{label}</span><strong>{value}</strong>{hint && <small>{hint}</small>}</div>;

export default function WeatherDetails({ forecast, unit }) {
  const c = forecast.current;
  const today = forecast.daily[0] ?? {};
  return (
    <section className="panel" aria-labelledby="details-heading">
      <div className="section-heading"><div><p className="eyebrow">Conditions</p><h2 id="details-heading">Weather details</h2></div></div>
      <div className="details-grid">
        <Detail label="Humidity" value={`${Math.round(c.humidity)}%`} />
        <Detail label="Wind" value={formatWind(c.windSpeed, unit)} hint={`${degreesToCompass(c.windDirection)} · gusts ${formatWind(c.windGusts, unit)}`} />
        <Detail label="Pressure" value={`${Math.round(c.pressure)} hPa`} />
        <Detail label="Visibility" value={formatVisibility(c.visibility, unit)} />
        <Detail label="Cloud cover" value={`${Math.round(c.cloudCover)}%`} />
        <Detail label="Precipitation" value={formatPrecipitation(c.precipitation, unit)} hint={`${Math.round(today.precipitationProbability ?? 0)}% daily chance`} />
        <Detail label="UV index" value={Number.isFinite(today.uvIndexMax) ? today.uvIndexMax.toFixed(1) : '—'} hint="Daily maximum" />
        <Detail label="Timezone" value={forecast.timezoneAbbreviation || forecast.timezone || 'Local'} />
      </div>
    </section>
  );
}
