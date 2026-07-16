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
interface EspressoShop {
  id: string;
  name: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  rating: number; // 1-5
  notes: string;
}
```

Shops with `latitude`/`longitude` set to `null` are excluded from the map. A console warning is logged for each one, and they're listed at the bottom of the page so you know what's missing. `src/utils/geo.ts` has a `geocodeShop` placeholder you can wire up to a real geocoding API to auto-fill coordinates from a shop's name/city.

The starter data was seeded from a personal list of shop names across five cities; coordinates for two entries (an unverified "Peruvian espresso" spot in San Francisco and "Copa Coffee" in Ho Chi Minh City) couldn't be confidently matched to a real address, so they're left blank rather than guessed. Ratings and notes were derived from each city list's ranking order since the source list didn't include them — edit `espresso-data.json` directly to correct them.

## Stack

- Vite + React + TypeScript
- Leaflet / React-Leaflet for the map
- Tailwind CSS for styling
