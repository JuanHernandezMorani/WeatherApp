# Weather App

A responsive weather dashboard for searching locations worldwide and viewing current conditions, the next 24 hours, and a seven-day forecast.

## Features

- Global city and place search with debounced suggestions.
- Browser geolocation for quick local weather.
- Current temperature, apparent temperature and condition summary.
- 24-hour forecast with precipitation probability.
- Seven-day outlook with high/low temperatures, precipitation and wind.
- Humidity, pressure, visibility, cloud cover, UV index and wind details.
- Sunrise and sunset times.
- Celsius/Fahrenheit display toggle with matching metric/imperial wind, precipitation and visibility formatting.
- Favorite and recent locations stored locally in the browser.
- Dark and light themes.
- Short-lived forecast cache for a more resilient UI.
- Clearly labeled demonstration fallback if live data is temporarily unavailable.
- Responsive layouts from compact phones through large desktop displays.

## Weather data

Live forecasts and location search are provided by [Open-Meteo](https://open-meteo.com/). The application does not require a client-side weather API key.

Open-Meteo weather data is provided under CC BY 4.0 and requires attribution. The application includes the required provider attribution in its footer.

## Development

Requirements:

- Node.js 20.19 or newer
- npm

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

Tests:

```bash
npm test
```

## Architecture

```text
src/
├── components/    Presentation components
├── core/          Weather normalization, formatting and storage helpers
├── data/          Default location and explicit demo fallback
├── services/      Open-Meteo API integration
├── App.jsx        Application state and orchestration
└── styles.css     Responsive theme and layout
```

## Privacy

Favorite and recent locations are stored only in the browser using `localStorage`. Browser geolocation is requested only after the user presses **My location**.

## License

MIT. See `LICENSE`.
