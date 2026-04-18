---
title: Estructura del Proyecto
description: Un recorrido por cada directorio y archivo de la plantilla starter.
---

El starter es un proyecto Astro estándar con algunas convenciones adicionales. A continuación se muestra el diseño completo con notas sobre qué hace cada directorio.

```
my-project/
├── public/
│   ├── favicon.svg          ← Reemplaza con tu logo
│   └── pictures/            ← Imágenes de demostración usadas en la plantilla
├── src/
│   ├── assets/
│   │   └── styles/
│   │       └── globals.css  ← Bloque @theme de Tailwind v4 + propiedades CSS personalizadas
│   ├── components/
│   │   ├── forms/           ← Button.astro y componentes relacionados con formularios
│   │   ├── layout/          ← Header.astro, Footer.astro
│   │   ├── navigation/      ← Navbar.astro, MobileMenu.astro
│   │   └── ui/              ← Logo, ThemeSwitcher, Accordion y otros primitivos
│   ├── config/              ← Módulos de configuración individuales (un tema por archivo)
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
│   ├── config.ts            ← Re-exportación central + mainMenu, footerLinks, socialLinks, studioInfo
│   ├── content.config.ts    ← Esquemas de colecciones de contenido de Astro (blog + autores)
│   ├── data/
│   │   ├── blog/            ← Entradas de blog en Markdown
│   │   └── authors/         ← Perfiles de autores en Markdown
│   ├── layouts/
│   │   ├── Layout.astro     ← Estructura principal de página (head, header, footer, modo oscuro)
│   │   └── DocsLayout.astro ← Layout opcional para documentación
│   ├── locales/
│   │   ├── en/              ← Traducciones en inglés
│   │   │   ├── common.json  ← Navegación, pie de página, banner de cookies, alternador de tema
│   │   │   ├── main.json    ← Hero, estadísticas, about, testimonios
│   │   │   └── sections.json← Características, precios, FAQ, contacto, etc.
│   │   └── es/              ← Traducciones en español (misma estructura)
│   ├── pages/
│   │   ├── index.astro      ← Redirige a home-1 (variante de landing predeterminada)
│   │   ├── home-1.astro     ← Landing de embudo SaaS
│   │   ├── home-2.astro     ← Landing de portafolio
│   │   ├── home-3.astro     ← Landing de servicios
│   │   ├── home-4.astro     ← Landing minimalista / cuadrícula suiza
│   │   ├── home-5.astro     ← Landing con Hero de marquesina
│   │   ├── blog/            ← Listado del blog y páginas de entradas
│   │   ├── [about]/         ← Página "Acerca de" (ruta dinámica con soporte i18n)
│   │   ├── [contact]/       ← Página de contacto
│   │   ├── [pricing]/       ← Página de precios
│   │   ├── about-2.astro    ← Layout alternativo de "Acerca de"
│   │   ├── contact-2.astro  ← Layout alternativo de contacto
│   │   ├── pricing-2.astro  ← Layout alternativo de precios
│   │   ├── components.astro ← Showcase de componentes / guía de estilos
│   │   ├── sign-in.astro
│   │   ├── sign-up.astro
│   │   ├── forgot-password.astro
│   │   ├── integrations/    ← Páginas de resumen de integraciones
│   │   ├── es/              ← Versiones en español de todas las páginas
│   │   └── robots.txt.ts    ← Generador dinámico de robots.txt
│   ├── sections/            ← Componentes de secciones a nivel de página
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
│   └── types.ts             ← Interfaces TypeScript compartidas (MenuItemProps, etc.)
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

## Convenciones clave

### `src/config/` vs `src/config.ts`

La configuración está dividida en dos capas:

- **`src/config/`** — un archivo por tema. Cada archivo exporta constantes tipadas para una sola sección del sitio (características, precios, equipo, etc.). Aquí es donde editas el contenido real.
- **`src/config.ts`** — re-exporta todo desde `src/config/` y define `mainMenu`, `footerLinks`, `socialLinks` y `studioInfo` directamente. Importa desde este archivo en cualquier lugar de tus componentes.

### `src/sections/` vs `src/components/`

- Las **secciones** son segmentos de página a todo ancho (Hero, Features, Pricing). Consumen datos de `src/config/` y `src/locales/` y se ensamblan en los archivos de página.
- Los **componentes** son primitivos reutilizables (Button, Accordion, ThemeSwitcher) que se usan dentro de secciones y layouts.

### Colecciones de contenido

Las entradas de blog y los perfiles de autores usan la Loader API de Astro, no el directorio heredado `src/content/`. Los datos viven en `src/data/blog/` y `src/data/authors/`. Los esquemas están en `src/content.config.ts`.

### Páginas i18n

Las páginas en español replican las páginas en inglés bajo `src/pages/es/`. Las rutas i18n dinámicas (como `[about]`) resuelven el idioma automáticamente según el prefijo de la URL.
