import React from 'react';
import { buildLocationLabel } from '../core/weather.js';

function LocationGroup({ title, items, current, onSelect, onRemove, removable }) {
  if (!items.length) return null;
  return (
    <div className="saved-group">
      <h3>{title}</h3>
      <div className="saved-chips">
        {items.map((location) => {
          const selected = current && Number(current.latitude) === Number(location.latitude) && Number(current.longitude) === Number(location.longitude);
          return (
            <div className={`saved-chip ${selected ? 'selected' : ''}`} key={`${location.id}-${location.latitude}-${location.longitude}`}>
              <button type="button" onClick={() => onSelect(location)}>{buildLocationLabel(location)}</button>
              {removable && <button type="button" className="remove-location" onClick={() => onRemove(location)} aria-label={`Remove ${location.name}`}>×</button>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function SavedLocations({ favorites, recent, current, onSelect, onRemoveFavorite }) {
  return (
    <section className="panel saved-panel" aria-labelledby="saved-heading">
      <div className="section-heading"><div><p className="eyebrow">Quick access</p><h2 id="saved-heading">Saved locations</h2></div></div>
      {favorites.length === 0 && recent.length === 0 ? (
        <p className="muted compact-copy">Search for a location or save the current one as a favorite to build quick access here.</p>
      ) : (
        <>
          <LocationGroup title="Favorites" items={favorites} current={current} onSelect={onSelect} onRemove={onRemoveFavorite} removable />
          <LocationGroup title="Recent" items={recent} current={current} onSelect={onSelect} onRemove={() => {}} />
        </>
      )}
    </section>
  );
}
