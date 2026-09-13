/**
 * GitHub Pages serves 404.html for any path it doesn't have a file for.
 * Shipping a copy of index.html as 404.html lets the Angular router handle
 * deep links like /meet-ashley on a hard refresh or a shared link.
 */
import { copyFile } from 'node:fs/promises';
import { join } from 'node:path';

const out = join(process.cwd(), 'dist', 'belisleforbirchwood', 'browser');
await copyFile(join(out, 'index.html'), join(out, '404.html'));
console.log('postbuild: 404.html written');
