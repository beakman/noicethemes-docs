---
title: Configuración
description: Referencia completa de src/config.ts y todos los módulos de configuración — la fuente única de verdad para el contenido y la navegación de tu sitio.
---

Todo el contenido editable por el comprador vive en dos lugares: **`src/config.ts`** (navegación, redes sociales, información de contacto del estudio) y los archivos individuales en **`src/config/`** (contenido de las secciones). Rara vez necesitas tocar un componente para cambiar texto.

## `src/config.ts`

El archivo de configuración raíz re-exporta cada módulo de `src/config/` y define la navegación directamente:

```ts
// Lo que importas en todas partes:
import { siteMeta, mainMenu, footerLinks, socialLinks, studioInfo } from "@/config";
```

### `siteMeta`

Definido en `src/config/site.ts`. Controla cada etiqueta `<head>` en cada página.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `title` | `string` | Título en la pestaña del navegador + título SEO + título Open Graph |
| `description` | `string` | Meta descripción + descripción Open Graph |
| `baseUrl` | `string` | URL completa de tu sitio en producción — usada en los sitemaps |
| `ogImage` | `string` | Ruta a la imagen que se muestra al compartir en redes sociales |
| `ogType` | `string` | Generalmente `"website"` |
| `twitterCreator` | `string` | Identificador de Twitter/X sin `@` |

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

Array de `MenuItemProps`. Cada elemento aparece en la barra de navegación superior.

```ts
export const mainMenu: MenuItemProps[] = [
  { name: "Features", href: "/#features" },
  { name: "Pricing",  href: "/#pricing"  },
  // Desplegable: añade un array children
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

Usa `labelKey` en lugar de `name` para obtener la etiqueta desde `src/locales/en/common.json` (necesario para menús i18n).

### `footerLinks`

Array de objetos de columna. Cada columna tiene una etiqueta `section` y un array `links`.

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

Se muestran en la barra de navegación de escritorio y en el pie del menú móvil. Los iconos usan [Tabler Icons](https://tabler.io/icons).

```ts
export const socialLinks = [
  { name: "Instagram", href: "https://instagram.com/you", icon: "tabler:brand-instagram" },
  { name: "TikTok",    href: "https://tiktok.com/@you",   icon: "tabler:brand-tiktok"    },
];
```

### `studioInfo`

Datos de contacto que se muestran en la sección de Contacto, el pie de página y el FAQ.

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

## Archivos de configuración de secciones (`src/config/`)

### `site.ts`

Además de `siteMeta`, exporta `hero`, `stats`, `about` y `testimonials`.

**`hero`** — `headline` (admite `<br />`), `subheading`, `ctaPrimaryText`, `ctaSecondaryText`, `establishedYear`.

**`stats`** — array de `{ value: string, label: string }` para la tira de estadísticas.

**`about`** — `sectionLabel`, `heading`, `paragraphs[]` (tres cadenas), `imageLabels[]`, `features[]` (icono + título + descripción).

**`testimonials`** — `sectionLabel`, `heading`, `summaryText` y `reviews[]` (nombre, fecha, puntuación, texto, estilo).

### `features.ts`

Tarjetas de características para la sección de Features:

```ts
{ icon: "tabler:bolt", title: "Fast builds", description: "Ships zero JS by default." }
```

### `pricing.ts`

Objetos de planes de precios. Establece `highlighted: true` para marcar un plan con un borde de acento:

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

Pasos numerados para la sección ProcessSteps:

```ts
{ step: "01", title: "Discovery", description: "We research your users and goals." }
```

### `services.ts`

Tarjetas de servicios. Exporta `services[]` y `servicesCta` (`{ text, href }`).

### `team.ts`

Miembros del equipo para la sección Team. Coloca las fotos en `public/team/` y referéncialas como `/team/nombre.jpg`:

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

Elementos del acordeón de preguntas frecuentes:

```ts
{ question: "What is your turnaround time?", answer: "Most projects take 4–8 weeks." }
```

### `logos.ts`

Logos de clientes o socios para la sección LogoBar. Cada entrada necesita un `name` y un `icon` (nombre de icono Tabler o ruta a un SVG local).
