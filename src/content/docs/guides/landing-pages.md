---
title: Landing Page Variants
description: Five ready-made landing page compositions to suit different business types — swap hero sections and reorder components to build your own.
---

The template ships with five landing page variants. Each is an independent `.astro` file that assembles sections in a different order and uses a different hero style. All five share the same `Layout.astro` shell, components, and config system.

---

## Variant overview

| File | URL | Hero style | Best for |
|------|-----|-----------|----------|
| `index.astro` | `/` | Centered glow mesh | SaaS / product |
| `home-1.astro` | `/home-1` | Same as index | SaaS funnel (reference) |
| `home-2.astro` | `/home-2` | Split layout + large image | Portfolio / freelance |
| `home-3.astro` | `/home-3` | Bold full-width type | Agency / services |
| `home-4.astro` | `/home-4` | Minimal Swiss grid | B2B / luxury / fintech |
| `home-5.astro` | `/home-5` | Diagonal image marquee | Creative studio / photography |

---

## Variant 1 — SaaS Funnel (`index.astro`)

The default landing page. Follows the classic SaaS conversion funnel:

```
Hero → LogoBar → CodeShowcase → ProcessSteps → Features → Stats
→ TwoColumn × 2 → Testimonials → Pricing → CTABanner → FAQ → Newsletter
```

Uses `transparentHeader={true}` so the hero extends behind the navbar. The `TwoColumn` sections accept inline props so you can swap heading, body, bullets, and CTA without editing the component.

---

## Variant 4 — Minimal Swiss Grid (`home-4.astro`)

Clean typographic hero with maximum whitespace, inspired by Swiss graphic design. No background effects — just bold type on white/dark.

```
HeroV4 → Services → About → Team → Gallery → Testimonials → Contact
```

`HeroV4` renders stats inline below the headline, not as a separate strip. The section order surfaces Services and About before social proof — suited to businesses where the offer needs explaining.

---

## Variant 5 — Marquee Hero (`home-5.astro`)

Full-viewport hero with 9 photos running on three diagonal marquee rows behind a dark overlay. Inspired by [tatstudio.framer.website](https://tatstudio.framer.website).

```
HeroMarquee → Services → About → Team → Gallery → Testimonials → Contact
```

Uses both `transparentHeader={true}` and `mobileSolidHeader={true}` because the image background makes the hamburger icon unreadable on mobile without a solid nav bar.

Images are loaded from `public/pictures/`. Replace them with your own photos — the marquee adapts to any number of images automatically.

---

## Using a variant as your homepage

To make a variant the site's homepage, edit `src/pages/index.astro` to mirror the variant you want. For example, to use the Marquee Hero as the default:

```astro
---
// src/pages/index.astro
import Layout from "@layouts/Layout.astro";
import HeroMarquee  from "@sections/HeroMarquee.astro";
import Services     from "@sections/Services.astro";
// ... import all sections you need

const lang = "en" as const;
---

<Layout lang={lang} transparentHeader={true} mobileSolidHeader={true}>
  <main id="main-content">
    <HeroMarquee lang={lang} />
    <Services lang={lang} />
    <!-- ... rest of sections -->
  </main>
</Layout>
```

---

## Creating a new variant

1. Copy any existing `home-N.astro` file and rename it.
2. Change the `transparentHeader` and `mobileSolidHeader` props to match your hero.
3. Swap the hero component and reorder sections.
4. Update the variation badge at the bottom of the page (or remove it).

The variation badge is purely cosmetic — a small pill showing which variant is active:

```astro
<div class="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full ...">
  <span class="h-2 w-2 rounded-full bg-accent"></span>
  Home Variation 6 · My Custom
</div>
```

---

## `TwoColumn` props reference

`TwoColumn` is the most flexible section. It accepts all data as props so you can use it multiple times on a page with different content:

```astro
<TwoColumn
  tag="The Best"
  heading="Highest quality<br />code, every time"
  body="Every component is written in TypeScript strict mode..."
  bullets={[
    { icon: "tabler:check", text: "TypeScript strict mode throughout" },
    { icon: "tabler:check", text: "WCAG AA accessible markup" },
  ]}
  cta={{ text: "View the source", href: "https://github.com/..." }}
  imagePosition="right"           // "left" | "right"
  imageGradient="from-primary/20 to-accent/15"
/>
```
