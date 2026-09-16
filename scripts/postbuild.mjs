/**
 * Runs after `ng build`.
 *
 * 1. 404.html — GitHub Pages serves this for any path it has no file for.
 *    We use index.csr.html (the un-prerendered shell) rather than the
 *    prerendered home page, so an unknown URL boots the app and lets the
 *    router redirect, instead of showing Home's content under a wrong URL.
 *
 * 2. sitemap.xml — built from the routes Angular actually prerendered, so it
 *    can never drift from what's deployed or list a URL that 404s.
 */
import { copyFile, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const ORIGIN = 'https://belisleforbirchwood.com';
const dist = join(process.cwd(), 'dist', 'bfb');
const out = join(dist, 'browser');

await copyFile(join(out, 'index.csr.html'), join(out, '404.html'));
console.log('postbuild: 404.html written from index.csr.html');

const { routes } = JSON.parse(await readFile(join(dist, 'prerendered-routes.json'), 'utf8'));
const lastmod = new Date().toISOString().slice(0, 10);

// Home first, then the rest alphabetically — purely for readability.
const paths = Object.keys(routes).sort((a, b) => (a === '/' ? -1 : b === '/' ? 1 : a.localeCompare(b)));

// Angular emits <route>/index.html, so the URL that actually returns 200 is the
// directory form with a trailing slash. Listing the bare path would make every
// sitemap entry a redirect.
const urls = paths
  .map((p) => (p === '/' ? '/' : `${p}/`))
  .map((p) => `  <url>\n    <loc>${ORIGIN}${p}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`)
  .join('\n');

await writeFile(
  join(out, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
  'utf8',
);
console.log(`postbuild: sitemap.xml written with ${paths.length} URLs (${paths.join(', ')})`);
