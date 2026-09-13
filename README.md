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
3. Settings → Pages → Custom domain: `belisleforbirchwood.com`, then tick
   **Enforce HTTPS** once the certificate is issued (can take up to ~24h).

`public/CNAME` already carries the domain, so it survives every deploy.

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

`scripts/postbuild.mjs` matters: GitHub Pages has no server-side routing, so a hard
refresh on `/meet-ashley` would 404. Pages serves `404.html` for unknown paths, and
since that file is the app, the Angular router picks the URL up and renders correctly.

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
