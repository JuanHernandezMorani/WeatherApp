# Weather App

A responsive weather dashboard for worldwide location search, current conditions, the next 24 hours, and a seven-day forecast.

## Features

- Worldwide city autocomplete.
- **My location** with reverse geocoding, so GPS coordinates resolve to the real city/region name instead of a generic label.
- Current conditions and derived apparent temperature.
- 24-hour forecast and seven-day outlook.
- Humidity, pressure, dew point, fog coverage, cloud cover, precipitation, wind/gusts and UV data when available.
- Locally calculated sunrise and sunset.
- Celsius/Fahrenheit display toggle.
- Favorites and recent locations stored in `localStorage`.
- Dark/light themes.
- Short-lived client forecast cache and clearly labeled demo fallback.
- Responsive layouts from compact phones to large desktops.

## Providers and public deployment

The public browser never calls third-party weather/geocoding providers with private credentials. It calls same-origin `/api/*` routes instead.

### Weather — MET Norway

Forecast data comes from the global **MET Norway Locationforecast 2.0** API. MET Norway data is open and can be reused commercially with attribution. Requests are made through the server gateway so the application can provide the identifying User-Agent requested by MET Norway and avoid sending each visitor's IP address directly to the weather provider.

### Search and reverse geocoding — Geoapify

Location autocomplete and reverse geocoding use **Geoapify**. Its Free plan supports commercial projects within plan limits, with attribution. The Geoapify key stays server-side and is never bundled into the React client.

The UI includes provider attribution in the footer.

## Required environment

Create `.env.local` for local development:

```env
GEOAPIFY_API_KEY=your_geoapify_key
MET_USER_AGENT=WeatherApp/2.1 portfolio-juanbhm-dev.vercel.app
```

`MET_USER_AGENT` is optional because the project contains a valid default identifier. `GEOAPIFY_API_KEY` is required for search and reverse geocoding.

Create a free Geoapify key from their MyProjects dashboard. Do **not** prefix it with `VITE_`; keeping the variable server-only prevents Vite from exposing it to browser bundles.

## Local development

Requirements:

- Node.js 20.19+
- npm

```bash
npm install
npm run dev
```

The Vite dev server includes a local `/api/*` middleware that uses the same provider layer as production, so `npm run dev` works with `.env.local` without installing a separate backend.

## Vercel deployment

The `/api` directory contains Vercel serverless functions. Add this environment variable in the Vercel project settings:

```text
GEOAPIFY_API_KEY
```

Optionally add `MET_USER_AGENT` if you want a different application identifier.

Then deploy normally. No weather API key is required for MET Norway.

## API routes

```text
GET /api/weather?lat=...&lon=...
GET /api/geocode?q=Buenos%20Aires&lang=es
GET /api/reverse-geocode?lat=-34.60&lon=-58.38&lang=es
```

Coordinates sent to MET Norway are rounded to four decimal places for cache friendliness and provider-policy compliance.

## Architecture

```text
api/                  Vercel serverless endpoints
server/providers.js   MET Norway + Geoapify provider gateway
src/components/       Presentation components
src/core/             Normalization, solar math, formatting and storage
src/data/             Default location and explicit demo fallback
src/services/         Browser same-origin API client
src/App.jsx           Application state/orchestration
src/styles.css         Responsive theme/layout
```

## Privacy

Favorites and recent locations remain in the browser. Geolocation is requested only after pressing **My location**. Provider calls go through the app's server-side gateway rather than exposing provider credentials in the browser.

## License

MIT. See `LICENSE`.
