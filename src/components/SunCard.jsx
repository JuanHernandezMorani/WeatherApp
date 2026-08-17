import React from 'react';
import { formatLocalTime } from '../core/weather.js';

export default function SunCard({ day }) {
  if (!day) return null;
  const format = (value) => formatLocalTime(value);
  return (
    <section className="panel sun-panel" aria-labelledby="sun-heading">
      <div className="section-heading"><div><p className="eyebrow">Daylight</p><h2 id="sun-heading">Sunrise & sunset</h2></div></div>
      <div className="sun-times">
        <div><span className="sun-symbol sunrise">↑</span><span><small>Sunrise</small><strong>{format(day.sunrise)}</strong></span></div>
        <div className="sun-line" aria-hidden="true"><span /></div>
        <div><span className="sun-symbol sunset">↓</span><span><small>Sunset</small><strong>{format(day.sunset)}</strong></span></div>
      </div>
    </section>
  );
}
