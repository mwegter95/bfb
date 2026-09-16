# Belisle for Birchwood

Campaign site for Ashley Belisle's write-in candidacy for Birchwood Village City Council.
Angular 22, statically built, deployed to GitHub Pages behind belisleforbirchwood.com.

---

## Run it locally

Requires Node 22.22.3+ (or 24.15+). Check with `node -v`.

```bash
npm install
npm start          # http://localhost:4200, opens automatically, live reload
```

To look at exactly what gets deployed:

```bash
npm run build      # outputs dist/belisleforbirchwood/browser + 404.html
npm run preview    # builds, then serves the real output on :4200
```

---

## Turn on the contact form

The Connect form posts to [Web3Forms](https://web3forms.com), which relays to Gmail.
Until a key is in place the form renders but stays disabled and shows the email address
instead — it never silently swallows a message.

1. Go to https://web3forms.com and enter **belisleforbirchwood@gmail.com**.
2. They email an access key (free, no account, 250 submissions/month).
3. Paste it into `src/app/site.config.ts`:

```ts
web3formsKey: 'paste-the-key-here',
```

4. Commit and push. Send yourself a test message.

---

## Deploy

Pushing to `main` builds and publishes automatically via
`.github/workflows/deploy.yml`.

**One-time setup on GitHub:**

1. Create the repo and push this project to `main`.
2. Settings → Pages → **Source: GitHub Actions**.
3. Settings → Pages → Custom domain: `belisleforbirchwood.com`. This is the only place
   the domain is set.
4. Wait for the certificate, then tick **Enforce HTTPS**. The checkbox stays greyed out
   until the certificate exists — it isn't a separate switch to find.

**`public/CNAME` does nothing here.** GitHub's docs: "If you are publishing from a custom
GitHub Actions workflow, no `CNAME` file is created, and any existing `CNAME` file is
ignored and is not required." The file is kept only as a fallback in case this ever
switches to branch-based publishing. Pushing does **not** disturb a pending certificate.

### If HTTPS never turns on

Symptom: the site loads fine over http, https shows an untrusted certificate for
`*.github.io`, and **Enforce HTTPS** is greyed out. That means the certificate was never
issued — DNS is not the problem if the DNS check is green.

The fix, from GitHub's docs: Settings → Pages → **Remove** next to the custom domain,
retype it, **Save**. That "will cancel and restart the provisioning process." Do it if
provisioning hasn't finished several minutes after the DNS check goes green.

Worth checking before assuming it's stuck:

```bash
# which certificate is actually being served
curl -sv https://belisleforbirchwood.com -o /dev/null 2>&1 | grep -i "subject:"
#   CN=*.github.io  -> no certificate issued yet
#   CN=belisleforbirchwood.com -> issued; tick Enforce HTTPS

# has any CA logged a certificate for the domain
curl -s "https://crt.sh/?q=belisleforbirchwood.com&output=json" | head -c 400
```

**One-time setup in Squarespace DNS** (Domains → belisleforbirchwood.com → DNS Settings →
add a custom record). Delete any existing A records for the root/`@` host first:

| Host  | Type  | Value             |
| ----- | ----- | ----------------- |
| `@`   | A     | `185.199.108.153` |
| `@`   | A     | `185.199.109.153` |
| `@`   | A     | `185.199.110.153` |
| `@`   | A     | `185.199.111.153` |
| `www` | CNAME | `<username>.github.io` |

Optional IPv6 (AAAA on `@`): `2606:50c0:8000::153`, `2606:50c0:8001::153`,
`2606:50c0:8002::153`, `2606:50c0:8003::153`.

DNS usually settles in 15–60 minutes.

---

## How it's put together

```
public/                 static assets copied verbatim into the build
  CNAME                 custom domain for GitHub Pages
  .nojekyll             stops Pages running Jekyll over the output
  img/                  hero graphic, portrait, social card
src/
  index.html            meta tags, Open Graph, Google Fonts
  styles.scss           the entire design system — colours, type, components
  app/
    site.config.ts      email, address, disclaimer, Web3Forms key
    app.html            header + footer shell
    app.routes.ts       three routes, lazily loaded
    pages/              home, meet-ashley, connect
scripts/postbuild.mjs   copies index.html to 404.html for deep links
```

### Prerendering

`angular.json` sets `outputMode: "static"` with `server: "src/main.server.ts"`, so every
route is rendered to a real HTML file at build time:

```
dist/belisleforbirchwood/browser/
  index.html              /
  meet-ashley/index.html  /meet-ashley/
  connect/index.html      /connect/
  404.html                everything else
  sitemap.xml
```

This matters for search. Before, `/meet-ashley` and `/connect` were served by `404.html`
with an **HTTP 404 status** — visitors saw the right page, but crawlers saw a 404 and
wouldn't index them. Now they return 200 with their real `<title>`, description and
canonical already in the HTML, rather than only after Angular boots.

No server runs at runtime; the output is still plain static files.

`scripts/postbuild.mjs` then:

- copies `index.csr.html` (the un-prerendered shell) to **404.html**, so a genuinely
  unknown URL boots the app and lets the router redirect, rather than showing Home's
  content under the wrong URL;
- writes **sitemap.xml** from `prerendered-routes.json`, so it can't drift from what was
  actually deployed or list a URL that 404s. URLs use the trailing-slash directory form,
  which is what returns 200 — the bare path only 301s to it.

`public/robots.txt` points at the sitemap. The canonical tag is set in `src/app/app.ts`;
the origin is hardcoded there and in `scripts/postbuild.mjs` — change both if the domain
ever moves.

### Colours

Sampled directly from the hero graphic and defined once at the top of `styles.scss`:

| Token          | Hex       | Used for                             |
| -------------- | --------- | ------------------------------------ |
| `--green`      | `#20AD69` | page and header background           |
| `--green-deep` | `#016B38` | all body text, bands, primary button |
| `--sky`        | `#ACE1FF` | accents, secondary button            |
| `--white`      | `#FFFFFF` | cards, text on deep green            |

### Type

Body and wordmark are **Fraunces**, a free variable serif tuned (`SOFT`/`WONK` axes) to
sit close to Roca One. Nav links are **Bebas Neue**.

To swap in real Roca later — an Adobe Fonts web project, or self-hosted files you've
licensed — add the font, then change one line in `styles.scss`:

```scss
--font-serif: "roca", "Fraunces", Georgia, serif;
```

Nothing else needs to move.
