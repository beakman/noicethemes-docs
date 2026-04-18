---
title: Project Structure
description: A tour of every directory and file in the starter template.
---

The starter is a standard Astro project with a handful of conventions layered on top. Here is the full layout with notes on what each directory does.

```
my-project/
├── public/
│   ├── favicon.svg          ← Replace with your logo
│   └── pictures/            ← Demo images used in the template
├── src/
│   ├── assets/
│   │   └── styles/
│   │       └── globals.css  ← Tailwind v4 @theme block + CSS custom properties
│   ├── components/
│   │   ├── forms/           ← Button.astro and form-related components
│   │   ├── layout/          ← Header.astro, Footer.astro
│   │   ├── navigation/      ← Navbar.astro, MobileMenu.astro
│   │   └── ui/              ← Logo, ThemeSwitcher, Accordion, and other primitives
│   ├── config/              ← Individual config modules (one concern per file)
│   │   ├── authors.ts
│   │   ├── contact.ts
│   │   ├── cookie.ts
│   │   ├── faq.ts
│   │   ├── features.ts
│   │   ├── logos.ts
│   │   ├── pricing.ts
│   │   ├── process.ts
│   │   ├── services.ts
│   │   ├── site.ts          ← siteMeta, hero, stats, about, testimonials
│   │   └── team.ts
│   ├── config.ts            ← Central re-export + mainMenu, footerLinks, socialLinks, studioInfo
│   ├── content.config.ts    ← Astro content collection schemas (blog + authors)
│   ├── data/
│   │   ├── blog/            ← Markdown blog posts
│   │   └── authors/         ← Markdown author profiles
│   ├── layouts/
│   │   ├── Layout.astro     ← Main page shell (head, header, footer, dark mode)
│   │   └── DocsLayout.astro ← Optional docs layout
│   ├── locales/
│   │   ├── en/              ← English translations
│   │   │   ├── common.json  ← Nav, footer, cookie banner, theme toggle
│   │   │   ├── main.json    ← Hero, stats, about, testimonials
│   │   │   └── sections.json← Features, pricing, FAQ, contact, etc.
│   │   └── es/              ← Spanish translations (same structure)
│   ├── pages/
│   │   ├── index.astro      ← Redirects to home-1 (default landing variant)
│   │   ├── home-1.astro     ← SaaS funnel landing page
│   │   ├── home-2.astro     ← Portfolio landing
│   │   ├── home-3.astro     ← Services landing
│   │   ├── home-4.astro     ← Minimal / Swiss grid landing
│   │   ├── home-5.astro     ← Marquee Hero landing
│   │   ├── blog/            ← Blog listing and post pages
│   │   ├── [about]/         ← About page (i18n-aware dynamic route)
│   │   ├── [contact]/       ← Contact page
│   │   ├── [pricing]/       ← Pricing page
│   │   ├── about-2.astro    ← Alternative about layout
│   │   ├── contact-2.astro  ← Alternative contact layout
│   │   ├── pricing-2.astro  ← Alternative pricing layout
│   │   ├── components.astro ← Component showcase / style guide
│   │   ├── sign-in.astro
│   │   ├── sign-up.astro
│   │   ├── forgot-password.astro
│   │   ├── integrations/    ← Integration overview pages
│   │   ├── es/              ← Spanish versions of all pages
│   │   └── robots.txt.ts    ← Dynamic robots.txt generator
│   ├── sections/            ← Page-level section components
│   │   ├── Hero.astro
│   │   ├── HeroV2.astro
│   │   ├── HeroV3.astro
│   │   ├── HeroV4.astro
│   │   ├── HeroMarquee.astro
│   │   ├── Features.astro
│   │   ├── Pricing.astro
│   │   ├── Testimonials.astro
│   │   ├── FAQ.astro  (Faq.astro)
│   │   ├── BlogGrid.astro
│   │   ├── CTABanner.astro
│   │   ├── CodeShowcase.astro
│   │   ├── Contact.astro
│   │   ├── Gallery.astro
│   │   ├── LogoBar.astro
│   │   ├── Newsletter.astro
│   │   ├── ProcessSteps.astro
│   │   ├── Services.astro
│   │   ├── Stats.astro
│   │   ├── Team.astro
│   │   └── TwoColumn.astro
│   └── types.ts             ← Shared TypeScript interfaces (MenuItemProps, etc.)
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

## Key conventions

### `src/config/` vs `src/config.ts`

Config is split into two layers:

- **`src/config/`** — one file per concern. Each file exports typed constants for a single section of the site (features, pricing, team, etc.). This is where you edit actual content.
- **`src/config.ts`** — re-exports everything from `src/config/` plus defines `mainMenu`, `footerLinks`, `socialLinks`, and `studioInfo` directly. Import from this file anywhere in your components.

### `src/sections/` vs `src/components/`

- **Sections** are full-width page segments (Hero, Features, Pricing). They consume data from `src/config/` and `src/locales/` and are assembled in page files.
- **Components** are reusable primitives (Button, Accordion, ThemeSwitcher) used inside sections and layouts.

### Content collections

Blog posts and authors use Astro's Loader API, not the legacy `src/content/` directory. The data lives in `src/data/blog/` and `src/data/authors/`. Schemas are in `src/content.config.ts`.

### i18n pages

Spanish pages mirror English pages under `src/pages/es/`. Dynamic i18n routes (like `[about]`) resolve language automatically based on the URL prefix.
