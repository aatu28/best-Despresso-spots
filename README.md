# Despresso Spots

An interactive 3D globe of cities where I've had good coffee, built with Vite, React, TypeScript, three.js, and Tailwind CSS.

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

One pin per city — drag to rotate the globe, scroll to zoom, click a pin to open a detail panel with the country and the list of cafes visited there. The "Country" filter (top-right) toggles which pins are shown without rebuilding the scene.

To add a city, add an entry to `espresso-data.json` with its coordinates and cafe names.

## Globe rendering

`src/components/Globe.tsx` sets up the three.js scene: a lit sphere, a faint lat/lon graticule, real coastlines, and a teardrop pin + halo + stem per city, with `OrbitControls` for drag/zoom/auto-rotate and raycasting for click-to-select. The coastline outline is real Natural Earth data (`world-atlas` npm package via `topojson-client`), baked once into `src/lib/coastlines.ts` as a flat lat/lon point array — no runtime geo-data fetch or dependency, matching the same approach used for the map before this became a globe.

## Design

Visual identity follows a design handoff for a "Coffee Coverage Globe" — warm, softly-lit white sphere, espresso-brown pins, Archivo typography, cream/near-black light/dark themes (`src/index.css`). The panel and pin data are adapted to what's actually in `espresso-data.json` (city + real cafe names) rather than the handoff's richer per-shop mock fields (neighborhood, blurb, tag) — those would have needed fabricating descriptive text about real businesses that wasn't provided.

## Stack

- Vite + React + TypeScript
- three.js (`OrbitControls`, raycasting) for the 3D globe
- Tailwind CSS for the surrounding UI, with a light/dark theme via CSS custom properties
