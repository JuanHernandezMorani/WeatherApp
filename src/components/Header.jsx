import React from 'react';

function SunIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>;
}
function MoonIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 15.5A8.5 8.5 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5Z"/></svg>;
}
function PinIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>;
}

export default function Header({ theme, onToggleTheme, unit, onToggleUnit, onUseLocation, locating }) {
  return (
    <header className="app-header">
      <div className="header-inner">
        <a className="brand" href="#top" aria-label="Weather App home">
          <img className="brand-mark" src="/own.png" alt="" aria-hidden="true" />
          <span><strong>Weather App</strong><small>Live forecast dashboard</small></span>
        </a>
        <div className="header-actions">
          <button className="header-button location-button" type="button" onClick={onUseLocation} disabled={locating}>
            <PinIcon /><span>{locating ? 'Locating…' : 'My location'}</span>
          </button>
          <button className="unit-toggle" type="button" onClick={onToggleUnit} aria-label={`Switch to degrees ${unit === 'C' ? 'Fahrenheit' : 'Celsius'}`}>
            <span className={unit === 'C' ? 'active' : ''}>°C</span><span className={unit === 'F' ? 'active' : ''}>°F</span>
          </button>
          <button className="icon-button" type="button" onClick={onToggleTheme} aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}>
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </div>
    </header>
  );
}
