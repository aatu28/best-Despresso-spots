// Screenshots the built site (dist/) into the 1200x630 social preview image.
// Usage: node scripts/og-image.mjs <output.png>   (run after `vite build`)
import { preview } from 'vite';
import { chromium } from 'playwright';

const out = process.argv[2];
if (!out) {
  console.error('usage: node scripts/og-image.mjs <output.png>');
  process.exit(1);
}

const server = await preview({ preview: { port: 4179, strictPort: true }, logLevel: 'error' });
const url = server.resolvedUrls?.local[0];
if (!url) throw new Error('vite preview did not report a local URL');

// CI runners have no GPU; Chromium only falls back to software WebGL when told to.
const browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader'] });
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, reducedMotion: 'reduce' });
  const errors = [];
  page.on('pageerror', (err) => errors.push(err.message));

  await page.goto(url, { waitUntil: 'networkidle' });
  await page.locator('canvas').waitFor({ state: 'visible' });
  // The globe fades in once its first frame renders; give fonts and the fade time to finish.
  await page.waitForFunction(() => {
    const canvas = document.querySelector('canvas');
    return canvas && getComputedStyle(canvas.parentElement).opacity === '1';
  });
  await page.waitForTimeout(1500);

  if (errors.length) throw new Error(`page errors while rendering:\n${errors.join('\n')}`);
  await page.screenshot({ path: out });
  console.log(`wrote ${out}`);
} finally {
  await browser.close();
  await server.close();
}
