# Espresso Spots

An interactive world map of cities where I've had good coffee, built with Vite, React, TypeScript, Leaflet, and Tailwind CSS.

## Getting started

```bash
npm install
npm run dev
```

## Data

City data lives in `src/data/espresso-data.json`, typed by `src/types/city.ts`:

```ts
interface CityStop {
  id: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  cafes: string[];
}
```

One marker per city — click it to see the country and the list of cafes visited there. City center coordinates are hardcoded (well-known values, no geocoding needed at this zoom level). The "Country" filter in the top bar narrows the map down to cities in a given country.

To add a city, add an entry to `espresso-data.json` with its coordinates and cafe names.

## Stack

- Vite + React + TypeScript
- Leaflet / React-Leaflet for the map
- Tailwind CSS for styling
