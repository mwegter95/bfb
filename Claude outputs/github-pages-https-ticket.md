# GitHub Support — Pages TLS certificate never provisioned

**Repository:** `mwegter95/belisleforbirchwood.com`
**Custom domain:** `belisleforbirchwood.com` (apex), with `www` as the alternate name
**Publishing source:** GitHub Actions workflow (`actions/deploy-pages@v4`)

## Problem

The Pages DNS check reports success and the site serves correctly over HTTP, but a TLS
certificate has never been issued for the custom domain. **Enforce HTTPS** is permanently
unavailable, and HTTPS requests are answered with GitHub's default `CN=*.github.io`
wildcard, which does not cover the domain — so every visitor gets an untrusted-certificate
warning.

I have removed and re-added the custom domain several times as the documentation
suggests, waiting between attempts. One of those attempts briefly reported
`NotServedByPagesError`; subsequent attempts reported success. No certificate has ever
appeared.

## Evidence that provisioning never reached Let's Encrypt

Certificate Transparency logging is mandatory for Let's Encrypt issuance. A crt.sh query
for the domain returns an **empty array** — no CA has ever logged a certificate for
`belisleforbirchwood.com`. This is not a case of a certificate that was issued but not
deployed to the edge; the request appears never to have been made or to have failed before
issuance.

## DNS configuration (verified from two independent resolvers)

Matches the recommended apex configuration in the documentation exactly.

| Type  | Name | Value |
| ----- | ---- | ----- |
| A     | @    | 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153 |
| AAAA  | @    | 2606:50c0:8000::153, 2606:50c0:8001::153, 2606:50c0:8002::153, 2606:50c0:8003::153 |
| CNAME | www  | mwegter95.github.io |

Confirmed against both Cloudflare (1.1.1.1) and Google (8.8.8.8) resolvers:

- Apex `A` returns exactly the four Pages addresses — no extra, stale, or parking records.
- Apex `AAAA` returns exactly the four Pages IPv6 addresses.
- `www` resolves through the CNAME to the same four IPv4 addresses.
- **No `CAA` record exists** on the apex or at the parent, so any CA may issue.
- DNSSEC validates end to end (`AD: true`, DS present at `.com`).
- No `ALIAS` / `ANAME` records, and no additional `A`/`AAAA` records on `@`.
- Authoritative nameservers: `nse1–nse4.squarespacedns.com` (Squarespace-managed DNS).

## Evidence the domain is correctly attached and served by Pages

- `http://belisleforbirchwood.com/` → **200**, `server: GitHub.com`, serving the site.
- `http://www.belisleforbirchwood.com/` → **301** to the apex, `server: GitHub.com`.
- `http://mwegter95.github.io/belisleforbirchwood.com/` → **301** to the custom domain,
  which only occurs when the custom domain is attached to the repository.
- No HTTP→HTTPS redirect is being issued, so the ACME HTTP-01 challenge path is plainly
  reachable.
- `http://belisleforbirchwood.com/.well-known/acme-challenge/<nonexistent>` → **404**,
  the expected response when no challenge is outstanding.

## Request

Please force certificate provisioning for this Pages site, or advise what is causing the
Let's Encrypt request to fail. The domain name is 23 characters, well under the 64-character
common-name limit, and every item in the "Verifying the DNS configuration" section of
*Securing your GitHub Pages site with HTTPS* is satisfied.
