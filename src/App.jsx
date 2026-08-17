import React, { useEffect, useMemo, useRef, useState } from 'react';
import Header from './components/Header.jsx';
import SearchBar from './components/SearchBar.jsx';
import CurrentWeather from './components/CurrentWeather.jsx';
import WeatherDetails from './components/WeatherDetails.jsx';
import HourlyForecast from './components/HourlyForecast.jsx';
import DailyForecast from './components/DailyForecast.jsx';
import SunCard from './components/SunCard.jsx';
import SavedLocations from './components/SavedLocations.jsx';
import { DEFAULT_LOCATION, getDemoForecast } from './data/demoWeather.js';
import { fetchForecast, searchLocations } from './services/openMeteo.js';
import { cacheForecast, readCachedForecast, readStorage, writeStorage } from './core/storage.js';
import { getWeatherMeta, normalizeLocation } from './core/weather.js';

const THEME_KEY = 'theme';
const UNIT_KEY = 'unit';
const FAVORITES_KEY = 'favorites';
const RECENT_KEY = 'recent';
const LAST_LOCATION_KEY = 'last-location';

function getInitialTheme() {
  const saved = readStorage(THEME_KEY, null);
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function sameLocation(a, b) {
  if (!a || !b) return false;
  return Math.abs(Number(a.latitude) - Number(b.latitude)) < 0.001 && Math.abs(Number(a.longitude) - Number(b.longitude)) < 0.001;
}

function uniqueLocations(items, limit = 8) {
  return items.filter((item, index, array) => array.findIndex((other) => sameLocation(item, other)) === index).slice(0, limit);
}

export default function App() {
  const [theme, setTheme] = useState(getInitialTheme);
  const [unit, setUnit] = useState(() => readStorage(UNIT_KEY, 'C'));
  const [favorites, setFavorites] = useState(() => readStorage(FAVORITES_KEY, []));
  const [recent, setRecent] = useState(() => readStorage(RECENT_KEY, []));
  const [location, setLocation] = useState(() => readStorage(LAST_LOCATION_KEY, DEFAULT_LOCATION));
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requestError, setRequestError] = useState('');
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [locating, setLocating] = useState(false);
  const weatherRequest = useRef(null);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    writeStorage(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => writeStorage(UNIT_KEY, unit), [unit]);
  useEffect(() => writeStorage(FAVORITES_KEY, favorites), [favorites]);
  useEffect(() => writeStorage(RECENT_KEY, recent), [recent]);
  useEffect(() => writeStorage(LAST_LOCATION_KEY, location), [location]);

  const loadWeather = async (nextLocation, { recordRecent = true } = {}) => {
    weatherRequest.current?.abort();
    const controller = new AbortController();
    weatherRequest.current = controller;
    setRequestError('');

    const cached = readCachedForecast(nextLocation);
    if (cached) {
      setForecast(cached);
      setLoading(false);
    } else {
      setLoading(true);
    }

    try {
      const live = await fetchForecast(nextLocation, { signal: controller.signal });
      cacheForecast(live);
      setForecast(live);
      setLocation(normalizeLocation(nextLocation));
      if (recordRecent) setRecent((current) => uniqueLocations([normalizeLocation(nextLocation), ...current], 6));
      setLoading(false);
    } catch (error) {
      if (error.name === 'AbortError') return;
      setLoading(false);
      if (cached) {
        setRequestError('Live weather is temporarily unavailable. Showing a recent cached forecast.');
        return;
      }
      const demo = getDemoForecast();
      setForecast(demo);
      setLocation(DEFAULT_LOCATION);
      setRequestError('Live weather is temporarily unavailable. Showing clearly labeled demonstration data for Buenos Aires.');
    }
  };

  useEffect(() => {
    loadWeather(location, { recordRecent: false });
    return () => weatherRequest.current?.abort();
    // Initial load only. The location state is updated by explicit user actions.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 3) {
      setSearchResults([]);
      setSearching(false);
      setSearchError('');
      return undefined;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setSearching(true);
      setSearchError('');
      try {
        const results = await searchLocations(trimmed, { signal: controller.signal });
        setSearchResults(results);
      } catch (error) {
        if (error.name !== 'AbortError') setSearchError('Could not search locations. Check your connection and try again.');
      } finally {
        if (!controller.signal.aborted) setSearching(false);
      }
    }, 350);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const selectLocation = (nextLocation) => {
    const normalized = normalizeLocation(nextLocation);
    setQuery('');
    setSearchResults([]);
    setLocation(normalized);
    loadWeather(normalized);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isFavorite = favorites.some((item) => sameLocation(item, location));

  const toggleFavorite = () => {
    if (isFavorite) {
      setFavorites((current) => current.filter((item) => !sameLocation(item, location)));
    } else {
      setFavorites((current) => uniqueLocations([location, ...current], 8));
    }
  };

  const removeFavorite = (item) => {
    setFavorites((current) => current.filter((entry) => !sameLocation(entry, item)));
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setRequestError('Geolocation is not supported by this browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false);
        const next = {
          id: `geo-${position.coords.latitude.toFixed(4)}-${position.coords.longitude.toFixed(4)}`,
          name: 'Current location',
          admin1: '',
          country: '',
          countryCode: '',
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timezone: 'auto',
        };
        selectLocation(next);
      },
      (error) => {
        setLocating(false);
        const message = error.code === 1
          ? 'Location permission was denied. You can still search for a city manually.'
          : 'Could not determine your current location.';
        setRequestError(message);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 10 * 60 * 1000 },
    );
  };

  const weatherTheme = useMemo(() => forecast ? getWeatherMeta(forecast.current.weatherCode).icon : 'clear', [forecast]);

  return (
    <div id="top" className={`app-shell atmosphere-${weatherTheme}`}>
      <Header
        theme={theme}
        onToggleTheme={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')}
        unit={unit}
        onToggleUnit={() => setUnit((current) => current === 'C' ? 'F' : 'C')}
        onUseLocation={useCurrentLocation}
        locating={locating}
      />

      <main className="main-layout">
        <section className="search-hero" aria-labelledby="search-title">
          <div>
            <p className="eyebrow">Global weather</p>
            <h2 id="search-title">A clear forecast, wherever you are.</h2>
            <p>Search any city or place to see current conditions, the next 24 hours and a full seven-day outlook.</p>
          </div>
          <SearchBar
            query={query}
            onQueryChange={setQuery}
            results={searchResults}
            onSelect={selectLocation}
            searching={searching}
            error={searchError}
          />
        </section>

        {requestError && (
          <div className="notice" role="status">
            <span>{requestError}</span>
            <button type="button" onClick={() => loadWeather(location, { recordRecent: false })}>Retry</button>
          </div>
        )}

        {loading && !forecast ? (
          <div className="weather-skeleton" aria-label="Loading weather">
            <div className="skeleton-block skeleton-hero" />
            <div className="skeleton-grid"><div/><div/><div/><div/></div>
          </div>
        ) : forecast ? (
          <>
            <CurrentWeather forecast={forecast} unit={unit} isFavorite={isFavorite} onToggleFavorite={toggleFavorite} />
            <div className="dashboard-grid">
              <div className="dashboard-main">
                <HourlyForecast hours={forecast.hourly} unit={unit} />
                <DailyForecast days={forecast.daily} unit={unit} />
              </div>
              <aside className="dashboard-side">
                <WeatherDetails forecast={forecast} unit={unit} />
                <SunCard day={forecast.daily[0]} />
                <SavedLocations favorites={favorites} recent={recent} current={location} onSelect={selectLocation} onRemoveFavorite={removeFavorite} />
              </aside>
            </div>
          </>
        ) : null}
      </main>

      <footer className="app-footer">
        <span>© 2026 Juan Braian Hernández Morani. All rights reserved.</span>
        <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Weather data by Open-Meteo.com</a>
      </footer>
    </div>
  );
}
