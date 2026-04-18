---
title: SSR Adapters
description: Switch from a fully-static build to server-side rendering with a Vercel, Netlify, Cloudflare, or Node.js adapter — and use hybrid mode to keep most pages static.
---

The template ships as a **static site** (`output: "static"`) by default — every page is pre-rendered at build time and served as plain HTML. That covers most use cases. When you need server-side logic (a contact form API route, auth-protected pages, on-demand CMS revalidation, personalization), you add an **adapter** and switch to `"server"` or `"hybrid"` output mode.

- **Official Astro docs:** [docs.astro.build/en/guides/on-demand-rendering](https://docs.astro.build/en/guides/on-demand-rendering/)
- **Adapter list:** [docs.astro.build/en/guides/integrations-guide](https://docs.astro.build/en/guides/integrations-guide/#official-integrations)

---

## Output modes

| Mode | Behaviour | When to use |
|------|-----------|-------------|
| `"static"` (default) | All pages pre-rendered at build time. No server required. | Pure content sites, blogs, landing pages |
| `"hybrid"` | Static by default. Individual routes opt in to server rendering with `export const prerender = false`. | Mostly static with a few dynamic endpoints (e.g. a contact form API route) |
| `"server"` | All routes server-rendered by default. Individual routes opt out with `export const prerender = true`. | Authenticated apps, heavy personalisation, large dynamic sites |

For this template, **`"hybrid"`** is the right choice in most cases — you keep all pages static and only add server rendering for the specific API routes you create.

---

## Vercel

**Install:**

```bash
pnpm add @astrojs/vercel
```

**`astro.config.mjs`:**

```ts
import { defineConfig } from "astro/config";
import vercel from "@astrojs/vercel";

export default defineConfig({
  output: "hybrid",   // or "server"
  adapter: vercel(),
});
```

Deploy by pushing to your connected GitHub repository or running `vercel --prod`. Vercel automatically detects the adapter and routes serverless function traffic to the right handler.

- **Docs:** [docs.astro.build/en/guides/integrations-guide/vercel](https://docs.astro.build/en/guides/integrations-guide/vercel/)
- **Edge functions:** Pass `{ edgeMiddleware: true }` to `vercel()` to run middleware on Vercel Edge instead of Node.js serverless.

:::note
The `@astrojs/vercel` package replaces the old `@astrojs/vercel/serverless` import path. Use the bare import shown above for Astro 5+.
:::

---

## Netlify

**Install:**

```bash
pnpm add @astrojs/netlify
```

**`astro.config.mjs`:**

```ts
import { defineConfig } from "astro/config";
import netlify from "@astrojs/netlify";

export default defineConfig({
  output: "hybrid",
  adapter: netlify(),
});
```

Server routes are deployed as Netlify Functions automatically. No `netlify.toml` changes are needed beyond what the [Deployment guide](/guides/deployment/) already covers.

- **Docs:** [docs.astro.build/en/guides/integrations-guide/netlify](https://docs.astro.build/en/guides/integrations-guide/netlify/)
- **Edge functions:** Pass `{ edgeMiddleware: true }` to `netlify()` to run middleware on Netlify Edge.

---

## Cloudflare Pages

**Install:**

```bash
pnpm add @astrojs/cloudflare
```

**`astro.config.mjs`:**

```ts
import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  output: "hybrid",
  adapter: cloudflare(),
});
```

Server routes run as **Cloudflare Workers** at the edge — extremely fast, global latency. The Cloudflare runtime is not Node.js, so some Node-specific APIs (`fs`, `crypto`) are unavailable. Use the [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) and web-standard alternatives instead.

- **Docs:** [docs.astro.build/en/guides/integrations-guide/cloudflare](https://docs.astro.build/en/guides/integrations-guide/cloudflare/)
- **Bindings (KV, D1, R2):** Access Cloudflare bindings via `Astro.locals.runtime.env` in `.astro` files or `context.locals.runtime.env` in API routes.

---

## Node.js (self-hosted)

Use this adapter when deploying to a VPS, Docker container, or any environment where you run a Node.js process directly.

**Install:**

```bash
pnpm add @astrojs/node
```

**`astro.config.mjs`:**

```ts
import { defineConfig } from "astro/config";
import node from "@astrojs/node";

export default defineConfig({
  output: "hybrid",
  adapter: node({ mode: "standalone" }),
});
```

`mode: "standalone"` produces a self-contained Node.js server at `dist/server/entry.mjs`. Start it with:

```bash
pnpm build
node dist/server/entry.mjs
```

Set the `PORT` and `HOST` environment variables to control where it listens (defaults: `3000` / `0.0.0.0`).

- **Docs:** [docs.astro.build/en/guides/integrations-guide/node](https://docs.astro.build/en/guides/integrations-guide/node/)
- **Middleware mode:** Use `mode: "middleware"` to mount the Astro app inside an existing Express or Fastify server.

---

## Hybrid mode in practice

Once you've added an adapter and set `output: "hybrid"`, all existing pages remain fully static — nothing breaks. You only add server rendering where you explicitly need it.

**Opting a page into server rendering:**

```ts
// src/pages/api/contact.ts  — server-rendered API route
export const prerender = false;

export const POST: APIRoute = async ({ request }) => { /* ... */ };
```

**Confirming a page stays static:**

```ts
// src/pages/index.astro — static (prerender = true is the hybrid default)
// No export needed — static is automatic in hybrid mode.
```

**Typical hybrid setup for this template:**

```
src/pages/
├── index.astro            → static  (default)
├── about/                 → static  (default)
├── blog/                  → static  (default)
└── api/
    ├── contact.ts         → server  (export const prerender = false)
    └── revalidate.ts      → server  (export const prerender = false)
```

---

## Environment variables in SSR

Server-side environment variables (no `PUBLIC_` prefix) are only available in server-rendered routes — never in static pages. They are never sent to the browser.

```ts
// src/pages/api/contact.ts
const apiKey = import.meta.env.RESEND_API_KEY;   // ✓ available in server route
```

```astro
---
// src/pages/index.astro (static page)
const apiKey = import.meta.env.RESEND_API_KEY;   // ✗ undefined — don't use private keys in static pages
---
```

Always add server-only variables to your host's environment settings (Vercel → Project → Settings → Environment Variables), not just `.env.local`.
