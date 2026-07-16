# Espresso Passport

An interactive world map of cities where I've had good coffee, built with Vite, React, TypeScript, and Tailwind CSS.

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

One marker per city — click it to open a "stamp card" with the country and the list of cafes visited there. The "Country" filter in the top bar narrows the map down to cities in a given country.

To add a city, add an entry to `espresso-data.json` with its coordinates and cafe names.

## Map rendering

The world map is a hand-built low-poly SVG (`src/lib/worldMap.ts` has the landmass outlines and the equirectangular projection), not a tile-based map library — no map tiles to fetch, no API keys, fully self-contained. `src/components/WorldMap.tsx` projects each city's lat/lon onto the SVG and renders it as a stamp marker; `src/components/StampCard.tsx` is the detail panel that slides in on click (a bottom sheet on narrow viewports).

The landmass shapes are stylized rather than geographically precise — good enough to place a city marker recognizably, not for cartographic accuracy.

## Stack

- Vite + React + TypeScript
- Hand-built SVG world map (equirectangular projection)
- Tailwind CSS for styling, with a light/dark "travel document" theme driven by CSS custom properties in `src/index.css`
