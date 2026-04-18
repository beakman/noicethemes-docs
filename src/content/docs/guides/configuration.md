---
title: Configuration
description: Full reference for src/config.ts and every config module — the single source of truth for your site's content and navigation.
---

All buyer-editable content lives in two places: **`src/config.ts`** (navigation, social links, studio contact info) and the individual files in **`src/config/`** (section content). You rarely need to touch a component to change copy.

## `src/config.ts`

The root config file re-exports every module from `src/config/` and defines the navigation directly:

```ts
// What you import everywhere:
import { siteMeta, mainMenu, footerLinks, socialLinks, studioInfo } from "@/config";
```

### `siteMeta`

Defined in `src/config/site.ts`. Controls every `<head>` tag on every page.

| Field | Type | Description |
|-------|------|-------------|
| `title` | `string` | Browser tab + SEO title + Open Graph title |
| `description` | `string` | Meta description + Open Graph description |
| `baseUrl` | `string` | Full URL of your live site — used in sitemaps |
| `ogImage` | `string` | Path to the image shown when sharing on social |
| `ogType` | `string` | Usually `"website"` |
| `twitterCreator` | `string` | Twitter/X handle without `@` |

```ts
export const siteMeta = {
  title: "My Studio",
  description: "We craft thoughtful digital experiences.",
  baseUrl: "https://yourdomain.com",
  ogImage: "./assets/og-image.png",
  ogType: "website",
  twitterCreator: "@yourstudio",
};
```

### `mainMenu`

Array of `MenuItemProps`. Each item appears in the top navbar.

```ts
export const mainMenu: MenuItemProps[] = [
  { name: "Features", href: "/#features" },
  { name: "Pricing",  href: "/#pricing"  },
  // Dropdown: add a children array
  {
    name: "Pages",
    href: "#",
    children: [
      { name: "Blog",    href: "/blog"    },
      { name: "Contact", href: "/contact" },
    ],
  },
];
```

Use `labelKey` instead of `name` to pull the label from `src/locales/en/common.json` (required for i18n menus).

### `footerLinks`

Array of column objects. Each column has a `section` label and a `links` array.

```ts
export const footerLinks = [
  {
    section: "Product",
    links: [
      { name: "Features", href: "/#features", target: "_self" },
      { name: "Pricing",  href: "/#pricing",  target: "_self" },
    ],
  },
  {
    section: "Social",
    links: [
      { name: "Instagram", href: "https://instagram.com/...", target: "_blank" },
    ],
  },
];
```

### `socialLinks`

Shown in the desktop navbar and mobile menu footer. Icons use [Tabler Icons](https://tabler.io/icons).

```ts
export const socialLinks = [
  { name: "Instagram", href: "https://instagram.com/you", icon: "tabler:brand-instagram" },
  { name: "TikTok",    href: "https://tiktok.com/@you",   icon: "tabler:brand-tiktok"    },
];
```

### `studioInfo`

Contact details rendered in the Contact section, footer, and FAQ.

```ts
export const studioInfo = {
  phone: "+1 (212) 555-0189",
  email: "hello@studio.design",
  address: "147 Bowery St, New York, NY 10002",
  hours: {
    weekdays: "Mon – Fri: 9am – 6pm",
    weekends: "Sat: 10am – 4pm",
  },
};
```

---

## Section config files (`src/config/`)

### `site.ts`

In addition to `siteMeta`, exports `hero`, `stats`, `about`, and `testimonials`.

**`hero`** — `headline` (supports `<br />`), `subheading`, `ctaPrimaryText`, `ctaSecondaryText`, `establishedYear`.

**`stats`** — array of `{ value: string, label: string }` for the stats strip.

**`about`** — `sectionLabel`, `heading`, `paragraphs[]` (three strings), `imageLabels[]`, `features[]` (icon + title + description).

**`testimonials`** — `sectionLabel`, `heading`, `summaryText`, and `reviews[]` (name, date, rating, text, style).

### `features.ts`

Feature cards for the Features section:

```ts
{ icon: "tabler:bolt", title: "Fast builds", description: "Ships zero JS by default." }
```

### `pricing.ts`

Pricing plan objects. Set `highlighted: true` to mark a plan with an accent border:

```ts
{
  name: "Pro",
  price: "$29",
  period: "/mo",
  description: "Everything you need to ship.",
  features: ["Unlimited pages", "Priority support"],
  cta: { text: "Get started", href: "/sign-up" },
  highlighted: true,
}
```

### `process.ts`

Numbered steps for the ProcessSteps section:

```ts
{ step: "01", title: "Discovery", description: "We research your users and goals." }
```

### `services.ts`

Service cards. Exports `services[]` and `servicesCta` (`{ text, href }`).

### `team.ts`

Team members for the Team section. Place photos in `public/team/` and reference them as `/team/name.jpg`:

```ts
{
  name: "Alex Rivera",
  role: "Creative Director",
  bio: "10+ years leading brand projects.",
  avatar: "/team/alex.jpg",
  social: { instagram: "alexrivera", twitter: "alexrivera" },
}
```

### `faq.ts`

FAQ accordion items:

```ts
{ question: "What is your turnaround time?", answer: "Most projects take 4–8 weeks." }
```

### `logos.ts`

Client/partner logos for the LogoBar section. Each entry needs a `name` and an `icon` (Tabler icon name or a local SVG path).
