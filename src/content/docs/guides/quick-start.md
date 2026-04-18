---
title: Quick Start
description: Clone the template, install dependencies, and have a dev server running in under 5 minutes.
---

This guide walks you from zero to a running local dev server.

## Prerequisites

- **Node.js 20+** — check with `node -v`
- **pnpm** — install with `npm install -g pnpm` if missing

## 1. Clone the repository

```bash
git clone https://github.com/noicethemes/starter-template my-project
cd my-project
```

Or download the ZIP from the purchase page and extract it.

## 2. Install dependencies

```bash
pnpm install
```

## 3. Start the dev server

```bash
pnpm dev
```

Open [http://localhost:4321](http://localhost:4321) in your browser. The server supports hot-module replacement — changes to `.astro`, `.ts`, and `.css` files reload instantly.

## 4. First things to edit

### Site metadata — `src/config/site.ts`

Open `src/config/site.ts` and update `siteMeta` with your own values:

```ts
export const siteMeta = {
  title: "My Studio",
  description: "A short description of your site for SEO.",
  baseUrl: "https://yourdomain.com",
  ogImage: "./assets/og-image.png",
  twitterCreator: "@yourhandle",
};
```

### Navigation and footer — `src/config.ts`

`src/config.ts` is the central re-export file. Edit `mainMenu` and `footerLinks` directly in that file to change navigation labels and URLs.

### Translations — `src/locales/en/`

All user-facing strings live in the `src/locales/en/` JSON files:

| File | Contents |
|------|----------|
| `common.json` | Nav labels, footer text, cookie banner, theme toggle |
| `main.json` | Hero, stats, about section, testimonials |
| `sections.json` | All other sections (features, pricing, FAQ, etc.) |

### Favicon — `public/favicon.svg`

Replace `public/favicon.svg` with your own logo file. SVG is recommended for quality at all sizes.

## 5. Build for production

```bash
pnpm build
```

This runs `astro check` (TypeScript type-checking) followed by `astro build`. Output goes to `./dist/`.

## 6. Preview the production build

```bash
pnpm preview
```

Serves the `dist/` directory locally so you can verify the production build before deploying.

## Next steps

- [Project Structure](/guides/project-structure/) — understand how files are organised
- [Configuration](/guides/configuration/) — full reference for `src/config.ts` and the config modules
- [Customization](/guides/customization/) — change colors, fonts, and sections
- [Deployment](/guides/deployment/) — push to Vercel, Netlify, or Cloudflare Pages
