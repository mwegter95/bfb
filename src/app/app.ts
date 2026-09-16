import { Component, DOCUMENT, inject } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { SITE } from './site.config';

/**
 * Kept here rather than in site.config.ts so that file stays purely the
 * things you edit (email, address, form key). scripts/postbuild.mjs holds the
 * same origin for the sitemap — change both if the domain ever moves.
 */
const ORIGIN = 'https://belisleforbirchwood.com';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
})
export class App {
  protected readonly site = SITE;

  constructor() {
    const doc = inject(DOCUMENT);
    const router = inject(Router);

    // Self-referencing canonical, baked into each prerendered page.
    router.events.pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd)).subscribe((e) => {
      const bare = e.urlAfterRedirects.split('#')[0].split('?')[0] || '/';
      // Prerendering emits <route>/index.html, so the canonical URL is the
      // directory form — the bare path only 301s to it.
      const path = bare === '/' ? '/' : `${bare.replace(/\/$/, '')}/`;
      let link = doc.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
      if (!link) {
        link = doc.createElement('link');
        link.setAttribute('rel', 'canonical');
        doc.head.appendChild(link);
      }
      link.setAttribute('href', ORIGIN + path);
    });
  }
}
