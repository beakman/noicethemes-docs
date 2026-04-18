---
title: Theme Configuration
description: Customise fonts, brand colours, border radius, and your logo from a single file — src/config/theme.ts.
---

All visual aspects of the starter — brand colours, fonts, border radius, and logo — are controlled from a single file:

```
src/config/theme.ts
```

Edit that file and every component across the entire site updates automatically. You never need to touch `globals.css` or `Layout.astro`.

---

## Logo

```ts
logo: {
  light: null,          // path in public/, e.g. "/logo.svg"
  dark:  null,          // e.g. "/logo-dark.svg" — falls back to light if null
  alt:   "Studio",      // accessible alt text
  class: "h-8 w-auto",  // Tailwind class controlling display size
},
```

Place your logo files in the `public/` directory and set the paths:

```ts
logo: {
  light: "/logo.svg",
  dark:  "/logo-dark.svg",
  alt:   "Acme Studio",
  class: "h-7 w-auto",
},
```

When `light` is `null`, the default inline SVG logomark is shown. If `dark` is `null` the light logo is used in both colour modes.

---

## Fonts

```ts
fonts: {
  googleFontsUrl: "https://fonts.googleapis.com/css2?...",
  sans:    '"Hanken Grotesk", ui-sans-serif, system-ui, sans-serif',
  display: '"Instrument Serif", ui-serif, Georgia, serif',
  mono:    '"JetBrains Mono", ui-monospace, monospace',
},
```

**To switch fonts:**

1. Go to [fonts.google.com](https://fonts.google.com), select your fonts, and copy the stylesheet URL.
2. Paste it into `googleFontsUrl`.
3. Update the `sans`, `display`, and `mono` family strings to match.

```ts
fonts: {
  googleFontsUrl:
    "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap",
  sans:    '"DM Sans", ui-sans-serif, system-ui, sans-serif',
  display: '"DM Serif Display", ui-serif, Georgia, serif',
  mono:    '"JetBrains Mono", ui-monospace, monospace',  // mono stays the same
},
```

| Role | Used for | Default |
|------|---------|---------|
| `sans` | Body text, labels, buttons, UI copy | Hanken Grotesk |
| `display` | All headings (`h1`–`h6`) | Instrument Serif |
| `mono` | Code blocks | JetBrains Mono |

---

## Border radius

```ts
radius: {
  xl: "0.75rem",   // cards, modals, large containers
  lg: "0.5rem",    // buttons, inputs, image tiles
  md: "0.375rem",  // badges, tooltips, small components
  sm: "0.25rem",   // checkboxes, toggles, tiny elements
},
```

These values feed directly into Tailwind's `rounded-*` utilities. A few example scales:

| Style | xl | lg | md | sm |
|-------|----|----|----|----|
| Sharp / geometric | `0` | `0` | `0` | `0` |
| Subtle (default) | `0.75rem` | `0.5rem` | `0.375rem` | `0.25rem` |
| Rounded | `1.25rem` | `0.875rem` | `0.625rem` | `0.375rem` |
| Pill | `9999px` | `9999px` | `9999px` | `9999px` |

---

## Colours

Colours use the [OKLCH colour space](https://oklch.com) — perceptually uniform, so light/dark pairs always look harmonious. The format is `"oklch(L% C H)"`:

- **L** — Lightness (0% = black, 100% = white)
- **C** — Chroma (0 = grey, higher = more vivid)
- **H** — Hue angle (0–360 — red → green → blue → back to red)

```ts
colors: {
  light: {
    primary:           "oklch(49%  0.100 183)",  // main brand colour
    primaryForeground: "oklch(100% 0     0  )",  // text on primary buttons
    accent:            "oklch(55%  0.110 42 )",  // secondary highlight
    accentForeground:  "oklch(100% 0     0  )",
    background:        "oklch(99%  0.004 155)",
    foreground:        "oklch(14%  0.015 183)",
    // … full set in theme.ts
  },
  dark: {
    primary:           "oklch(65%  0.095 183)",  // lighter for dark bg
    // …
  },
},
```

### Changing the brand colour

Most rebrands only need two values: `primary` (light) and `primary` (dark).

1. Find your hex colour at [oklch.com](https://oklch.com) — paste the hex and copy the OKLCH output.
2. For the dark variant, keep the same **H** and **C** but raise **L** by ~15–20 points.

```ts
// Example: brand colour #2563eb (blue)
colors: {
  light: {
    primary:           "oklch(52% 0.220 264)",
    primaryForeground: "oklch(100% 0 0)",
    ring:              "oklch(52% 0.220 264)",
    // keep everything else the same
  },
  dark: {
    primary:           "oklch(68% 0.200 264)",  // same H/C, higher L
    ring:              "oklch(68% 0.200 264)",
    // keep everything else the same
  },
},
```

### Full colour token reference

| Token | Usage |
|-------|-------|
| `primary` / `primaryForeground` | Buttons, active states, focus rings |
| `accent` / `accentForeground` | Section labels, hover highlights, tags |
| `background` / `foreground` | Page background and default text |
| `card` / `cardForeground` | Card and panel surfaces |
| `muted` / `mutedForeground` | Subtle backgrounds, placeholder text |
| `border` | Dividers, input borders, card outlines |
| `input` | Input field border colour |
| `ring` | Keyboard focus outline colour |
| `surface` / `surfaceMuted` | Hero overlays, code block backgrounds |
| `destructive` / `destructiveForeground` | Error states, delete confirmations |

---

## How it works

`Layout.astro` calls `buildThemeCSS()` at build time and injects the result as a `<style>` block early in `<head>`:

```html
<style>
  :root {
    --font-sans: "Hanken Grotesk", …;
    --color-primary: oklch(49% 0.100 183);
    --radius-lg: 0.5rem;
    /* … all tokens … */
  }
  .dark {
    --color-primary: oklch(65% 0.095 183);
    /* … */
  }
</style>
```

Tailwind v4 utility classes reference these variables at runtime (`bg-primary` → `background-color: var(--color-primary)`), so every component across the site inherits the new values without any Tailwind rebuild step.

The `@theme` block in `globals.css` still exists — it registers the token names so Tailwind generates the utility classes. But the actual values come from `theme.ts`, not from that file.
