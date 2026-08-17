import React from 'react';
import { buildLocationLabel } from '../core/weather.js';

function SearchIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>;
}

export default function SearchBar({ query, onQueryChange, results, onSelect, searching, error }) {
  const open = query.trim().length >= 3 && (searching || results.length > 0 || error);
  return (
    <div className="search-block">
      <label className="search-box" htmlFor="location-search">
        <SearchIcon />
        <input
          id="location-search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search city or place…"
          autoComplete="off"
          spellCheck="false"
        />
        {searching && <span className="spinner" aria-label="Searching" />}
      </label>
      {open && (
        <div className="search-results" role="listbox" aria-label="Location suggestions">
          {searching && results.length === 0 && <p className="search-message">Searching locations…</p>}
          {!searching && error && <p className="search-message error-text">{error}</p>}
          {!searching && !error && results.length === 0 && <p className="search-message">No matching locations found.</p>}
          {results.map((location) => (
            <button key={`${location.id}-${location.latitude}-${location.longitude}`} type="button" onClick={() => onSelect(location)} role="option">
              <span><strong>{location.name}</strong><small>{[location.admin1, location.country].filter(Boolean).join(', ')}</small></span>
              <span className="result-coordinates">{location.latitude.toFixed(2)}, {location.longitude.toFixed(2)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
