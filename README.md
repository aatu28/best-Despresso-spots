# D-espresso Spots

An interactive 3D globe of cities where I've had good coffee, built with Vite, React, TypeScript, three.js, and Tailwind CSS.

## Getting started

```bash
npm install
npm run dev
```

## Data

City data lives in `src/data/espresso-data.json`, typed by `src/types/city.ts`:

```ts
interface Cafe {
  name: string;
  description: string;
}

interface CityStop {
  id: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  cafes: Cafe[];
}
```

One pin per city — drag to rotate the globe, scroll to zoom, click a pin to open a detail panel with the country and the list of cafes visited there. Tap a cafe in that list to expand a short description of the spot. The "Country" filter (top-right) toggles which pins are shown without rebuilding the scene. Below it, `src/components/CityFinder.tsx` is a combined search/browse box — focus it empty to see every city grouped by country, or type to filter by city, country, or cafe name; selecting a result opens that city regardless of the current country filter. Selecting a city (by pin, search, or deep link) updates the URL to `?city=<id>`, and the detail panel has a "Copy link" button that copies that URL — so any spot can be linked or bookmarked directly.

To add a city, add an entry to `espresso-data.json` with its coordinates and cafes. A cafe's `description` is a real, sourced one-liner (official site / press / reviews) — if nothing about a name could be verified, set it to the literal string `"UNVERIFIED"` rather than inventing something; the panel shows "No verified details yet." for those instead of fabricated text.

## Globe rendering

`src/components/Globe.tsx` sets up the three.js scene: a lit sphere, a faint lat/lon graticule, real coastlines, and a teardrop pin + halo + stem per city, with `OrbitControls` for drag/zoom/auto-rotate and raycasting for click-to-select. The coastline outline is real Natural Earth data (`world-atlas` npm package via `topojson-client`), baked once into `src/lib/coastlines.ts` as a flat lat/lon point array — no runtime geo-data fetch or dependency, matching the same approach used for the map before this became a globe.

Tightly-grouped pins (e.g. the US west coast) collapse into a numbered cluster badge — a plain HTML button positioned each frame from the pin's projected screen coordinates, drawn over the canvas rather than as a 3D object. Clicking one zooms the camera in until the group is loose enough to split back into individual pins. Selecting a city (from a pin, the search box, or a `?city=` link) also reorients the camera to face it, but only when it isn't already comfortably in view, so a click near the center of the visible hemisphere doesn't cause a jump. The `Globe` component itself is lazy-loaded (`React.lazy`) so three.js ships in its own chunk instead of blocking the initial page render.

## Design

A coffee-travel-journal identity: warm ivory paper with a subtle grain, a single clay accent (`#B4623D`) for pins, links and the rotated "field notes" stamp motifs, Fraunces serif for place names and headlines paired with Archivo for UI and body text, and cream/near-black light/dark themes (`src/index.css`). The panel and pin data are adapted to what's actually in `espresso-data.json` (city + real cafe names) rather than inventing richer per-shop fields (neighborhood, blurb, tag) that weren't provided.

## Stack

- Vite + React + TypeScript
- three.js (`OrbitControls`, raycasting) for the 3D globe
- Tailwind CSS for the surrounding UI, with a light/dark theme via CSS custom properties
