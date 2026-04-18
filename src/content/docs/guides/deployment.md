---
title: Deployment
description: Deploy to Vercel, Netlify, Cloudflare Pages, or any static host. One command and a build directory is all you need.
---

The template ships as a **fully static site** (`output: "static"` is the Astro default). The `pnpm build` command produces a `dist/` directory that you can drop on any static host with zero server-side requirements.

---

## Before you deploy

```bash
# 1. Verify there are no TypeScript errors
pnpm build

# 2. Preview the production build locally
pnpm preview
```

`pnpm build` runs `astro check` (type-checking) then `astro build`. Fix any errors before pushing.

---

## Vercel

The fastest path. Connect your GitHub repository in the Vercel dashboard and Vercel detects Astro automatically.

**Manual deploy (CLI):**

```bash
npm install -g vercel   # install once
vercel                  # first deploy — follow the prompts
vercel --prod           # subsequent production deploys
```

**Settings to confirm in Vercel dashboard:**

| Setting | Value |
|---------|-------|
| Framework Preset | Astro |
| Build Command | `pnpm build` |
| Output Directory | `dist` |
| Node.js Version | 20.x |

**Environment variables:** Vercel → Project → Settings → Environment Variables. Add any `STRAPI_URL`, `DIRECTUS_URL`, etc. here — never commit them to the repo.

---

## Netlify

**Via Netlify UI:**

1. Connect your repository.
2. Set Build command: `pnpm build`
3. Set Publish directory: `dist`
4. Set environment variable `NODE_VERSION` to `20`.

**Via `netlify.toml`** (add to project root):

```toml
[build]
  command = "pnpm build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "20"
```

**Deploy hooks:** In Netlify → Site settings → Build & deploy → Build hooks, create a hook URL. Paste it in your CMS webhook settings to trigger rebuilds on content publish.

---

## Cloudflare Pages

1. Log into Cloudflare Dashboard → Pages → Create a project.
2. Connect your Git provider and select the repository.
3. Set:

| Setting | Value |
|---------|-------|
| Framework preset | Astro |
| Build command | `pnpm build` |
| Build output directory | `dist` |
| Environment variable | `NODE_VERSION = 20` |

4. Click **Save and Deploy**.

Cloudflare's global CDN means excellent Lighthouse scores with minimal config.

---

## Self-hosted / static host

Any host that serves static files works (nginx, Apache, AWS S3 + CloudFront, Bunny CDN, etc.):

```bash
pnpm build
# Upload the dist/ directory to your host
```

**nginx example config:**

```nginx
server {
  listen 80;
  root /var/www/my-site/dist;
  index index.html;

  # SPA-style fallback for Astro's file-based routing
  location / {
    try_files $uri $uri/ $uri.html =404;
  }
}
```

---

## Adding SSR (server-side rendering)

The template is static by default. To enable SSR (required for form submissions, auth, or on-demand CMS revalidation):

1. Install an adapter:

```bash
# Vercel
pnpm add @astrojs/vercel

# Netlify
pnpm add @astrojs/netlify

# Cloudflare
pnpm add @astrojs/cloudflare
```

2. Update `astro.config.mjs`:

```ts
import vercel from "@astrojs/vercel/serverless";

export default defineConfig({
  output: "server",
  adapter: vercel(),
});
```

3. Pages that should remain static can opt out individually:

```ts
// src/pages/about.astro
export const prerender = true;
```

---

## Environment variables

Variables prefixed with `PUBLIC_` are exposed to the client. All others are server-only:

```bash
# .env.local (never commit this file)
STRAPI_API_TOKEN=abc123          # server-only
PUBLIC_PLAUSIBLE_DOMAIN=you.com  # exposed to client
```

Add the same variables in your hosting provider's dashboard for production. The `.env.local` file is already in `.gitignore`.
