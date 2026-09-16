import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * Every route is generated as a static file at build time, so GitHub Pages can
 * serve /meet-ashley and /connect as real 200s instead of falling through to
 * 404.html. No server is involved at runtime.
 */
export const serverRoutes: ServerRoute[] = [{ path: '**', renderMode: RenderMode.Prerender }];
