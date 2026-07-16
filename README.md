# Espresso Spots

An interactive map of my personal espresso shop rankings, built with Vite, React, TypeScript, Leaflet, and Tailwind CSS.

## Getting started

```bash
npm install
npm run dev
```

## Data

Shop data lives in `src/data/espresso-data.json`, typed by `src/types/shop.ts`:

```ts
type Vibe = 'Favorite' | 'Great' | 'Good' | 'Decent';

interface EspressoShop {
  id: string;
  name: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  vibe: Vibe;
  notes: string;
}
```

Ranking is vibes-based rather than numeric — each shop gets one of four tiers (`Favorite` down to `Decent`), used for marker color, the popup badge, and the "Vibe" filter in the top bar.

Shops with `latitude`/`longitude` set to `null` are excluded from the map. A console warning is logged for each one, and they're listed at the bottom of the page. `src/utils/geo.ts` has a `geocodeShop` placeholder you can wire up to a real geocoding API to auto-fill coordinates from a shop's name/city.

Coordinates were resolved by hand from known street addresses (no geocoding API was available while building this), so treat pin placement as approximate — check `notes` for the source address on each shop and correct `espresso-data.json` directly if a pin looks off.

## Stack

- Vite + React + TypeScript
- Leaflet / React-Leaflet for the map
- Tailwind CSS for styling
