# SKYCAST PRO

A premium, production-ready global weather platform built with React, Vite and the free [Open-Meteo](https://open-meteo.com/) APIs. No account, API key or payment is required for any core feature.

## Features

- **Live current conditions** — temperature, feels-like, condition, high/low, humidity, wind speed and direction, visibility, pressure, UV index, precipitation, cloud cover and US AQI where available.
- **Animated weather scenes** — sun rays, drifting clouds, rain, snow and a star-filled night sky, selected automatically from the current weather code and day/night state.
- **Global city search** — debounced autocomplete for any city on Earth, with country and region, keyboard navigation, favourites and recent searches.
- **Geolocation** — "use my location" with a manual-search fallback when permission is denied.
- **Hourly forecast** — smooth horizontal 24-hour strip plus a 24-hour table.
- **7-day forecast** — daily conditions, highs/lows with temperature-range bars, rain probability, wind, sunrise, sunset and UV.
- **Analytics** — five interactive Recharts visualisations: 24-hour temperature, 7-day high/low trends, precipitation probability, humidity and wind speed. All update instantly when the city changes.
- **Weather map** — interactive Leaflet map on OpenStreetMap tiles with selected, favourite and recent city markers, zoom/fit controls and click-to-select. No fake radar overlay is displayed.
- **Air quality** — US AQI gauge, plain-language category, health advice and PM2.5, PM10, CO, NO₂ and O₃ readings.
- **Navigation** — collapsible desktop sidebar, responsive mobile bottom navigation and slide-out menu with active indicators.
- **Settings** — Celsius/Fahrenheit, km/h/mph, dark/light theme, 12/24-hour clock, configurable auto-refresh and location settings, all persisted in `localStorage`.
- **Resilience** — in-memory API caching, request timeouts, abortable requests, retry actions, graceful offline/error/empty states, loading skeletons and in-place refresh errors that keep the last good forecast.

## Install and run

Requirements: Node.js 20.19+ or 22.12+ (Node 22 LTS recommended).

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev
```

Open the local URL printed by Vite (normally <http://localhost:5173>).

## Production build

```bash
npm run build      # outputs the static site to dist/
npm run preview    # preview the production build locally
npm run lint       # run Oxlint
```

Deploy the `dist/` folder to any static host (Netlify, Vercel, Cloudflare Pages, GitHub Pages, nginx, etc.). No environment variables or secrets are needed.

## Data sources

- [Open-Meteo Geocoding API](https://open-meteo.com/en/docs/geocoding-api) — city search
- [Open-Meteo Weather Forecast API](https://open-meteo.com/en/docs) — current, hourly and daily forecasts
- [Open-Meteo Air Quality API](https://open-meteo.com/en/docs/air-quality-api) — AQI and pollutants
- [OpenStreetMap](https://www.openstreetmap.org/copyright) — map tiles via Leaflet

All times are shown in the selected city's local timezone, as returned by the API. Weather values are modelled estimates, not official observations.

## Project structure

```
src/
  components/
    air/          Air quality gauge and pollutant cards
    charts/       Recharts visualisations
    layout/       Sidebar, top bar, mobile navigation
    map/          Leaflet map
    search/       Debounced global city search
    ui/           Panels, skeletons, state messages, shared controls
    weather/      Hero, metrics, sun path, hourly and daily forecasts
  context/        Global preferences, favourites, location and weather state
  hooks/          Cached weather/air hooks, geolocation, debounce, storage
  services/       Open-Meteo API client with caching and error handling
  utils/          Weather codes, units, AQI/UV categories and time formatting
  views/          Seven routed dashboard sections
```
