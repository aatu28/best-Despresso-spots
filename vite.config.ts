import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

interface Cafe {
  name: string;
  description: string;
}

interface CityStop {
  country: string;
  cafes: Cafe[];
}

// The meta description (and its og:/twitter: copies) quotes live city/cafe/
// country counts. Reading them from the data file at build time means they
// can't drift out of sync the way three separate hardcoded strings did.
function siteDescription(): string {
  const dataPath = fileURLToPath(new URL('./src/data/espresso-data.json', import.meta.url));
  const cities = JSON.parse(readFileSync(dataPath, 'utf-8')) as CityStop[];
  const cafes = cities.reduce((sum, c) => sum + c.cafes.length, 0);
  const countries = new Set(cities.map((c) => c.country)).size;
  return `An interactive 3D globe of ${cities.length} cities and ${cafes} cafes across ${countries} countries — a real coffee travel log.`;
}

function injectLiveCounts(): Plugin {
  return {
    name: 'inject-live-counts',
    transformIndexHtml(html) {
      return html.replaceAll('{{SITE_DESCRIPTION}}', siteDescription());
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  base: '/best-Despresso-spots/',
  plugins: [react(), tailwindcss(), injectLiveCounts()],
})
