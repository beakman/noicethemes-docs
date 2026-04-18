---
title: Variantes de Landing Page
description: Cinco composiciones de landing page listas para usar, adaptadas a diferentes tipos de negocio — intercambia secciones hero y reordena componentes para crear la tuya.
---

La plantilla incluye cinco variantes de landing page. Cada una es un archivo `.astro` independiente que ensambla secciones en un orden diferente y usa un estilo de hero distinto. Las cinco comparten el mismo shell `Layout.astro`, los mismos componentes y el mismo sistema de configuración.

---

## Resumen de variantes

| Archivo | URL | Estilo del hero | Ideal para |
|---------|-----|----------------|-----------|
| `index.astro` | `/` | Malla de luz centrada | SaaS / producto |
| `home-1.astro` | `/home-1` | Igual que index | Embudo SaaS (referencia) |
| `home-2.astro` | `/home-2` | Diseño dividido + imagen grande | Portafolio / freelance |
| `home-3.astro` | `/home-3` | Tipografía bold a todo ancho | Agencia / servicios |
| `home-4.astro` | `/home-4` | Cuadrícula suiza minimalista | B2B / lujo / fintech |
| `home-5.astro` | `/home-5` | Marquesina de imágenes diagonal | Estudio creativo / fotografía |

---

## Variante 1 — Embudo SaaS (`index.astro`)

La landing page predeterminada. Sigue el embudo de conversión SaaS clásico:

```
Hero → LogoBar → CodeShowcase → ProcessSteps → Features → Stats
→ TwoColumn × 2 → Testimonials → Pricing → CTABanner → FAQ → Newsletter
```

Usa `transparentHeader={true}` para que el hero se extienda detrás de la barra de navegación. Las secciones `TwoColumn` aceptan props en línea para que puedas cambiar el encabezado, el cuerpo, las viñetas y el CTA sin editar el componente.

---

## Variante 4 — Cuadrícula Suiza Minimalista (`home-4.astro`)

Hero tipográfico limpio con el máximo espacio en blanco, inspirado en el diseño gráfico suizo. Sin efectos de fondo — solo tipografía bold sobre blanco/oscuro.

```
HeroV4 → Services → About → Team → Gallery → Testimonials → Contact
```

`HeroV4` renderiza las estadísticas en línea debajo del encabezado, no como una tira separada. El orden de las secciones presenta Services y About antes de la prueba social — adecuado para negocios donde la oferta necesita explicación.

---

## Variante 5 — Hero con Marquesina (`home-5.astro`)

Hero de viewport completo con 9 fotos en tres filas de marquesina diagonal detrás de una capa oscura superpuesta. Inspirado en [tatstudio.framer.website](https://tatstudio.framer.website).

```
HeroMarquee → Services → About → Team → Gallery → Testimonials → Contact
```

Usa tanto `transparentHeader={true}` como `mobileSolidHeader={true}` porque el fondo de imagen hace que el icono hamburguesa sea ilegible en móvil sin una barra de navegación sólida.

Las imágenes se cargan desde `public/pictures/`. Reemplázalas con tus propias fotos — la marquesina se adapta automáticamente a cualquier número de imágenes.

---

## Usar una variante como página de inicio

Para que una variante sea la página de inicio del sitio, edita `src/pages/index.astro` para que refleje la variante que quieres. Por ejemplo, para usar el Hero con Marquesina como predeterminado:

```astro
---
// src/pages/index.astro
import Layout from "@layouts/Layout.astro";
import HeroMarquee  from "@sections/HeroMarquee.astro";
import Services     from "@sections/Services.astro";
// ... importa todas las secciones que necesites

const lang = "en" as const;
---

<Layout lang={lang} transparentHeader={true} mobileSolidHeader={true}>
  <main id="main-content">
    <HeroMarquee lang={lang} />
    <Services lang={lang} />
    <!-- ... resto de secciones -->
  </main>
</Layout>
```

---

## Crear una nueva variante

1. Copia cualquier archivo `home-N.astro` existente y renómbralo.
2. Cambia las props `transparentHeader` y `mobileSolidHeader` para que coincidan con tu hero.
3. Intercambia el componente hero y reordena las secciones.
4. Actualiza el badge de variante al final de la página (o elimínalo).

El badge de variante es puramente cosmético — una pequeña píldora que muestra qué variante está activa:

```astro
<div class="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full ...">
  <span class="h-2 w-2 rounded-full bg-accent"></span>
  Home Variation 6 · Mi Personalización
</div>
```

---

## Referencia de props de `TwoColumn`

`TwoColumn` es la sección más flexible. Acepta todos los datos como props para que puedas usarla varias veces en una página con contenido diferente:

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
