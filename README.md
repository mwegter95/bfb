# bfb

A three-page static site. Angular 22, prerendered at build time, deployed to GitHub Pages
behind a custom domain.

The domain lives in `public/CNAME`; the contact address and form key live in
`src/app/site.config.ts`. Those two files are the only places either value appears, so
this README uses placeholders.

---

## Run it locally

Requires Node 22.22.3+ (or 24.15+). Check with `node -v`.

```bash
npm install
npm start          # http://localhost:4200, opens automatically, live reload
```

To look at exactly what gets deployed:

```bash
npm run build      # prerenders every route, writes 404.html and sitemap.xml
npm run preview    # builds, then serves the real output on :4200
```

---

## Turn on the contact form

The contact form posts to [Web3Forms](https://web3forms.com), which relays to the address
in `src/app/site.config.ts`. Until a key is in place the form renders but stays disabled
and shows the address instead — it never silently swallows a message.

1. Go to https://web3forms.com and enter the destination address.
2. They email an access key (free, no account, 250 submissions/month).
3. Paste it into `src/app/site.config.ts` as `web3formsKey`.
4. Commit and push, then send yourself a test message.

---

## Deploy

Pushing to `main` builds and publishes automatically via `.github/workflows/deploy.yml`.

**One-time setup on GitHub:**

1. Settings → Pages → **Source: GitHub Actions**.
2. Settings → Pages → Custom domain: the domain in `public/CNAME`. This is the only place
   the domain is registered with Pages.
3. Wait for the certificate, then tick **Enforce HTTPS**. The checkbox stays greyed out
   until the certificate exists — it isn't a separate switch to find.

**`public/CNAME` does nothing here.** Per GitHub's docs: "If you are publishing from a
custom GitHub Actions workflow, no `CNAME` file is created, and any existing `CNAME` file
is ignored and is not required." It's kept only as a fallback in case this ever switches
to branch-based publishing. Pushing does **not** disturb a pending certificate.

**DNS**, at the registrar. Delete any pre-existing A records on the root/`@` host first:

| Host  | Type  | Value |
| ----- | ----- | ----- |
| `@`   | A     | `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` |
| `@`   | AAAA  | `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153` |
| `www` | CNAME | `<username>.github.io` |

DNS usually settles in 15–60 minutes.

### If HTTPS never turns on

Symptom: the site loads fine over http, https shows an untrusted certificate for
`*.github.io`, and **Enforce HTTPS** is greyed out. The certificate was never issued — DNS
is not the problem if the DNS check is green.

```bash
# which certificate is actually served
curl -sv https://<your-domain> -o /dev/null 2>&1 | grep -i "subject:"
#   CN=*.github.io  -> no certificate issued yet

# has any CA ever logged one (empty result = the request never reached Let's Encrypt)
curl -s "https://crt.sh/?q=<your-domain>&output=json" | head -c 400
```

Fix, from GitHub's docs: Settings → Pages → **Remove** next to the custom domain, retype
it, **Save**. That "will cancel and restart the provisioning process."

Two things learned the hard way here:

- Removing the domain detaches it, and for a moment Pages serves nothing at that hostname.
  The health check fires on save — if it samples in that window it reports
  `NotServedByPagesError` even though DNS is perfect. **Re-save at most once**, then leave
  it and reload the page; repeated retries manufacture the very error they're meant to fix.
- Apex provisioning can wedge indefinitely while the `www` subdomain succeeds immediately.
  Setting the custom domain to `www.` and letting the apex redirect to it is what finally
  issued the certificate.

---

## How it's put together

```
public/                 static assets copied verbatim into the build
  CNAME                 custom domain (inert with Actions publishing; see above)
  .nojekyll             stops Pages running Jekyll over the output
  robots.txt            allow-all, points at the sitemap
  favicon.*             see "Favicons" below
  img/                  hero graphic, portrait, social card
src/
  index.html            meta tags, Open Graph, Google Fonts
  styles.scss           the entire design system — colours, type, components
  main.server.ts        prerender entry
  app/
    site.config.ts      address, disclaimer, Web3Forms key
    app.html            header + footer shell
    app.ts              canonical-URL handling
    app.routes.ts       three routes, lazily loaded
    app.routes.server.ts  every route marked Prerender
    pages/              the three page components
scripts/postbuild.mjs   writes 404.html and sitemap.xml
```

### Prerendering

`angular.json` sets `outputMode: "static"` with `server: "src/main.server.ts"`, so every
route becomes a real HTML file at build time:

```
dist/bfb/browser/
  index.html              /
  <route>/index.html      /<route>/
  404.html                everything else
  sitemap.xml
```

This matters for search. Without it, sub-routes are served by `404.html` with an **HTTP
404 status** — visitors see the right page, but crawlers see a 404 and won't index it.
Prerendered, they return 200 with their real `<title>`, description and canonical already
in the HTML rather than only after Angular boots.

No server runs at runtime; the output is still plain static files.

`scripts/postbuild.mjs` then:

- copies `index.csr.html` (the un-prerendered shell) to **404.html**, so a genuinely
  unknown URL boots the app and lets the router redirect, rather than showing the home
  page's content under the wrong URL;
- writes **sitemap.xml** from `prerendered-routes.json`, so it can't drift from what was
  deployed or list a URL that 404s. URLs use the trailing-slash directory form, which is
  what returns 200 — the bare path only 301s to it.

Canonical tags are set in `src/app/app.ts`. The origin is hardcoded there and in
`scripts/postbuild.mjs` — change both if the domain moves.

Gotchas, all of which cost real time:

- `main.server.ts` must pass `BootstrapContext` to `bootstrapApplication`, or the build
  fails with **NG0401 "Missing Platform"** and prerenders 0 routes.
- `@angular/platform-server` is a required peer even though `@angular/ssr` is what you
  import.
- If the lockfile drifts so `@angular/router` sits on a different patch than
  `@angular/core`, every `@angular/ssr` install fails on ERESOLVE. Delete `node_modules`
  and `package-lock.json` and reinstall.
- `.gitignore` covers `/.angular`, not just `/.angular/cache`, because prerendering also
  writes `.angular/prerender-root`.

### Favicons

**Google Search does not read SVG favicons** — supported formats are BMP, GIF, ICO, PNG,
JPEG, PPM and TIFF. So raster versions are declared ahead of the SVG:

```html
<link rel="icon" href="favicon.ico" sizes="32x32" />
<link rel="icon" href="favicon-96.png" type="image/png" sizes="96x96" />
<link rel="icon" href="favicon.svg" type="image/svg+xml" />
<link rel="apple-touch-icon" href="apple-touch-icon.png" />
```

Browsers prefer the SVG; Google takes a raster one. The `<link>` tags must be on the
**home page**, and the favicon applies at hostname level.

### Snippet control

The footer's mailing address and email were being pulled into Google's auto-generated
search snippet. The footer wrapper carries `data-nosnippet`, which excludes that block
from snippets while leaving it visible on the page. It only works on `span`, `div` and
`section`, and must be in the served HTML — never toggled by JavaScript.

### Colours

Sampled from the hero graphic and defined once at the top of `styles.scss`:

| Token          | Hex       | Used for                             |
| -------------- | --------- | ------------------------------------ |
| `--green`      | `#20AD69` | page and header background           |
| `--green-deep` | `#016B38` | body text, bands, primary button     |
| `--sky`        | `#ACE1FF` | accents, secondary button            |
| `--white`      | `#FFFFFF` | cards, text on deep green            |

`--gutter` is `5.885%` — the inset of the hero artwork's own text. The wordmark, every
card edge and the nav's right gutter all derive from it, so the whole page lines up with
the artwork at any width. Don't add a `max-width` to `.wrap` or `.hero__img`; that breaks
the alignment.

White on `#20AD69` measures 2.9:1, under WCAG AA. Two places carry that knowingly: the
navbar (matches the artwork) and the copy on the contact page. `--header-bg` is a
standalone variable — set it to `var(--green-deep)` for 6.7:1. Everything else passes AA.

### Type

Body and wordmark are **Fraunces**, a free variable serif tuned via its `SOFT`/`WONK`
axes. Nav links are **Bebas Neue**. Both from Google Fonts.

The design was drawn in a commercial face that can't be redistributed as a webfont. To
swap in a licensed copy — an Adobe Fonts web project, or self-hosted files — add it, then
change one line in `styles.scss`:

```scss
--font-serif: "<licensed-family>", "Fraunces", Georgia, serif;
```

Nothing else needs to move.
