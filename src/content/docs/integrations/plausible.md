---
title: Plausible Analytics
description: Add privacy-first analytics to your site with Plausible — no cookies, GDPR compliant, no consent banner required.
---

[Plausible](https://plausible.io) is a lightweight, open-source analytics tool. It has no cookies, collects no personal data, and is fully GDPR / CCPA compliant — meaning **you do not need a cookie consent banner for analytics alone**.

---

## 1. Cloud setup

Sign up at [plausible.io](https://plausible.io) and add your domain. Plausible will give you a script snippet — you just need the domain name, not the full snippet.

---

## 2. Add the script to `Layout.astro`

Open `src/layouts/Layout.astro` and add the Plausible script in the `<head>`:

```astro
<head>
  <!-- ... existing tags ... -->

  <!-- Plausible Analytics — no cookies, GDPR compliant -->
  {import.meta.env.PUBLIC_PLAUSIBLE_DOMAIN && (
    <script
      is:inline
      defer
      data-domain={import.meta.env.PUBLIC_PLAUSIBLE_DOMAIN}
      src="https://plausible.io/js/script.js"
    />
  )}
</head>
```

The `is:inline` directive ensures the script renders exactly as written (no Astro bundling). The conditional `{import.meta.env.PUBLIC_PLAUSIBLE_DOMAIN && ...}` means the script is omitted in development — tracking only fires in production.

---

## 3. Set the environment variable

```bash
# .env.local (development — omit to skip tracking locally)
# PUBLIC_PLAUSIBLE_DOMAIN=yourdomain.com

# Production: set in Vercel / Netlify / Cloudflare dashboard
PUBLIC_PLAUSIBLE_DOMAIN=yourdomain.com
```

Variables prefixed with `PUBLIC_` are safe to expose in the browser.

---

## 4. Track custom events

Plausible supports custom events for tracking button clicks, form submissions, and other interactions.

```astro
---
// src/sections/Hero.astro
---
<Button
  href="/contact"
  onclick="plausible('CTA Click', {props: {button: 'Hero Primary'}})"
>
  Book a consultation
</Button>
```

Or in a client-side script:

```ts
// anywhere in a <script> block
function trackCTA(label: string) {
  if (typeof window.plausible === "function") {
    window.plausible("CTA Click", { props: { button: label } });
  }
}
```

Custom events appear in Plausible under **Goals** — you need to create the goal in the dashboard first (Plausible → your site → Goals → + Goal → Custom event).

---

## 5. Self-hosting (optional)

If you prefer to host Plausible yourself:

```bash
# docker-compose.yml
version: "3.3"
services:
  plausible_db:
    image: postgres:15
    environment:
      POSTGRES_DB: plausible_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres

  plausible_events_db:
    image: clickhouse/clickhouse-server:23.3

  plausible:
    image: ghcr.io/plausible/community-edition:v2
    ports:
      - "8000:8000"
    environment:
      BASE_URL: https://analytics.yourdomain.com
      SECRET_KEY_BASE: <generate with openssl rand -hex 64>
    depends_on:
      - plausible_db
      - plausible_events_db
```

Then update the script `src` in `Layout.astro`:

```astro
src="https://analytics.yourdomain.com/js/script.js"
```

---

## 6. Outbound link tracking

To track clicks on external links, swap the standard script for the `outbound-links` extension:

```astro
src="https://plausible.io/js/script.outbound-links.js"
```

No other changes needed — Plausible will automatically record outbound link clicks as `Outbound Link: Click` events.

---

## Privacy notes

- Plausible does not use cookies or fingerprinting.
- No personal data (IP address, user agent) is stored.
- All measurements are aggregated — you see page views and events, not individuals.
- This means you can run Plausible without a cookie consent banner in most jurisdictions (EU, UK, US).
- If you use other tracking tools alongside Plausible that do set cookies (e.g. Meta Pixel, Google Ads), the cookie consent banner in this template handles those separately.
