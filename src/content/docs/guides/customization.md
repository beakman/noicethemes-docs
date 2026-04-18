---
title: Customization
description: Change colors, fonts, sections, and landing page variants without touching component internals.
---

## Colors

All colors are CSS custom properties in the `@theme` block at the top of `src/assets/styles/globals.css`. The template uses **OKLCH** — a perceptually uniform color space that produces harmonious tints automatically.

```css
/* src/assets/styles/globals.css */
@theme {
  --color-primary:    oklch(49%  0.100 183);  /* deep teal   */
  --color-accent:     oklch(55%  0.110 42 );  /* terracotta  */
  --color-background: oklch(99%  0.004 155);  /* near-white  */
  --color-foreground: oklch(14%  0.015 183);  /* near-black  */
  --color-muted:      oklch(95%  0.010 155);
  --color-border:     oklch(87%  0.015 150);
}
```

Dark mode overrides live in the `.dark {}` block immediately below:

```css
@layer base {
  .dark {
    --color-background: oklch(14%  0.015 183);
    --color-foreground: oklch(94%  0.010 150);
    --color-primary:    oklch(65%  0.095 183);  /* lighter for dark bg */
    --color-accent:     oklch(72%  0.110 42 );
  }
}
```

To change the brand color, update `--color-primary` and its `.dark` counterpart. Every button, badge, link, ring, and focus state inherits the new value automatically.

A useful OKLCH picker: [oklch.com](https://oklch.com).

---

## Typography

| Variable | Default font | Usage |
|----------|-------------|-------|
| `--font-display` | Instrument Serif | All headings (`h1`–`h6`) |
| `--font-sans` | Hanken Grotesk | Body text, UI labels, buttons |
| `--font-mono` | JetBrains Mono | Code blocks |

To swap fonts:

1. Replace the `<link>` tag in `src/layouts/Layout.astro` with your chosen Google Font URL.
2. Update the font variables in the `@theme` block:

```css
@theme {
  --font-sans:    "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-display: "Playfair Display", ui-serif, Georgia, serif;
}
```

---

## Dark mode

The template defaults to dark mode. The `ThemeSwitcher` component toggles a `.dark` class on `<html>` and persists the choice in `localStorage`.

To default to **light mode**, change the opening `<html>` tag in `src/layouts/Layout.astro`:

```html
<!-- dark default (original) -->
<html lang={lang} class="dark" style="color-scheme: dark;">

<!-- light default -->
<html lang={lang} style="color-scheme: light;">
```

Also update the inline theme-init `<script is:inline>` in the same file so it falls back to `"light"` instead of `"dark"`.

---

## Sections

Each file in `src/sections/` is independent. To add or remove sections, edit the page file:

```astro
<!-- src/pages/index.astro -->
<main id="main-content">
  <Hero lang={lang} />
  <!-- remove a section by deleting the line -->
  <div class="scroll-reveal"><Features /></div>
  <!-- add a section by importing and placing it -->
  <div class="scroll-reveal"><MyNewSection /></div>
</main>
```

### Available sections

| Component | Best for |
|-----------|----------|
| `Hero.astro` | SaaS / product landing — centered with glow mesh |
| `HeroV2.astro` | Portfolio — split layout with large image |
| `HeroV3.astro` | Agency / services — bold full-width type |
| `HeroV4.astro` | B2B / luxury — minimal Swiss grid, left-aligned |
| `HeroMarquee.astro` | Creative studio — diagonal scrolling image background |
| `LogoBar.astro` | Client logo strip (auto-scroll) |
| `Features.astro` | Three-column feature cards |
| `CodeShowcase.astro` | Tabbed code block with copy column |
| `ProcessSteps.astro` | Numbered process timeline |
| `Stats.astro` | Key numbers strip |
| `TwoColumn.astro` | Flexible two-column with bullets and CTA |
| `Services.astro` | Service cards grid |
| `About.astro` | About section with image grid and feature cards |
| `Team.astro` | Team member cards |
| `Gallery.astro` | Horizontal marquee image gallery |
| `Testimonials.astro` | Masonry review grid |
| `Pricing.astro` | Pricing plan cards |
| `CTABanner.astro` | Full-width call-to-action banner |
| `Faq.astro` | Sticky heading + accordion FAQ |
| `BlogGrid.astro` | Latest posts grid |
| `Newsletter.astro` | Email capture form |
| `Contact.astro` | Contact form with studio info sidebar |

---

## Transparent navbar

Pass `transparentHeader={true}` to `Layout` to make the navbar start fully transparent and blur in on scroll. Use this whenever the hero extends behind the nav:

```astro
<Layout lang={lang} transparentHeader={true}>
```

For `home-5` (the marquee hero), also add `mobileSolidHeader={true}` — this gives the hamburger row a solid background at mobile widths where the image background makes icons unreadable:

```astro
<Layout lang={lang} transparentHeader={true} mobileSolidHeader={true}>
```

---

## Scroll reveal

Wrap any section or element in `class="scroll-reveal"` to get a fade + slide-up entrance on viewport intersection. Stagger children with `delay-1` through `delay-6`:

```astro
<p class="scroll-reveal section-label">Label</p>
<h2 class="scroll-reveal delay-1">Heading</h2>
<p class="scroll-reveal delay-2">Body copy</p>
```

The observer runs in `Layout.astro`. The animation is skipped when `prefers-reduced-motion` is active.
