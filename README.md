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

`src/components/Globe.tsx` sets up the three.js scene: a lit paper-colored sphere with a faint lat/lon graticule, continents drawn as a dense field of ~4,600 small circular points (a custom `ShaderMaterial`), and a wax-seal-red teardrop pin + halo + stem per city. At this point density the land reads as filled continents without any geometry or texture generation — `OrbitControls` handles drag/zoom/auto-rotate; raycasting handles click-to-select.

The land-dot positions are real data: baked once from `world-atlas`'s land polygons via `d3-geo`'s `geoContains` (temporarily installed, then removed — the same one-shot-bake-then-remove approach used for the coastline data this replaced) into `src/lib/landDots.ts`, a flat lat/lon array sampled on a Fibonacci sphere for even coverage — no runtime geo-data dependency. Getting this right surfaced two real bugs worth knowing about if you regenerate it: the lat/lon↔xyz conversion has to be the *exact* algebraic inverse of `toVector()` (a sign error here doesn't rotate the pattern, it silently scrambles which points land where); and points need a large-enough radial offset above the sphere's own surface (`RADIUS * 1.03`, matching the pins) or they z-fight and vanish specifically near screen center, where perspective doesn't yet compress them into a visible band the way it does near the limb.

Tightly-grouped pins (e.g. the US west coast) collapse into a numbered cluster badge — a plain HTML button positioned each frame from the pin's projected screen coordinates, drawn over the canvas rather than as a 3D object. Clicking one zooms the camera in until the group is loose enough to split back into individual pins. Selecting a city (from a pin, the search box, or a `?city=` link) also reorients the camera to face it, but only when it isn't already comfortably in view, so a click near the center of the visible hemisphere doesn't cause a jump. The `Globe` component itself is lazy-loaded (`React.lazy`) so three.js ships in its own chunk instead of blocking the initial page render.

## Design

A "quiet airmail" identity: aged cream paper with a subtle grain, a muted red/teal diagonal stripe along the very top and bottom edges (the classic airmail-envelope border, turned down to a whisper), a postmark-brass ink for stamps and labels, wax-seal red for pins and links, Fraunces serif for place names and headlines paired with Archivo for UI and body text (`src/index.css`). The corner badge is an actual postage stamp — a coffee-cup icon, the real cafe count, "cafes" — and the detail panel's "Coverage: Active" is styled the same way. Dark mode (`prefers-color-scheme`) isn't just an inverted palette; it's a different mood entirely — a dim walnut-lacquer interior with the same postmark ink in a lighter brass, arrived at by exploring a Japanese kissaten (coffee-house) direction and merging it with this one rather than shipping either alone. The globe itself stays visually independent of the page theme (always the lit paper sphere), so in dark mode it reads as a paper globe glowing in a dark room. The panel and pin data are adapted to what's actually in `espresso-data.json` (city + real cafe names) rather than inventing richer per-shop fields (neighborhood, blurb, tag) that weren't provided.

## Stack

- Vite + React + TypeScript
- three.js (`OrbitControls`, raycasting) for the 3D globe
- Tailwind CSS for the surrounding UI, with a light/dark theme via CSS custom properties
