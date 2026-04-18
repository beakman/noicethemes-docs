---
title: Personalización
description: Cambia colores, fuentes, secciones y variantes de landing page sin tocar el código interno de los componentes.
---

## Colores

Todos los colores son propiedades CSS personalizadas en el bloque `@theme` al inicio de `src/assets/styles/globals.css`. La plantilla usa **OKLCH** — un espacio de color perceptualmente uniforme que produce tonos armoniosos de forma automática.

```css
/* src/assets/styles/globals.css */
@theme {
  --color-primary:    oklch(49%  0.100 183);  /* verde azulado oscuro */
  --color-accent:     oklch(55%  0.110 42 );  /* terracota             */
  --color-background: oklch(99%  0.004 155);  /* casi blanco           */
  --color-foreground: oklch(14%  0.015 183);  /* casi negro            */
  --color-muted:      oklch(95%  0.010 155);
  --color-border:     oklch(87%  0.015 150);
}
```

Las sobreescrituras para el modo oscuro viven en el bloque `.dark {}` inmediatamente a continuación:

```css
@layer base {
  .dark {
    --color-background: oklch(14%  0.015 183);
    --color-foreground: oklch(94%  0.010 150);
    --color-primary:    oklch(65%  0.095 183);  /* más claro para fondo oscuro */
    --color-accent:     oklch(72%  0.110 42 );
  }
}
```

Para cambiar el color de marca, actualiza `--color-primary` y su contraparte en `.dark`. Cada botón, badge, enlace, anillo y estado de foco heredará el nuevo valor automáticamente.

Un selector OKLCH útil: [oklch.com](https://oklch.com).

---

## Tipografía

| Variable | Fuente predeterminada | Uso |
|----------|-----------------------|-----|
| `--font-display` | Instrument Serif | Todos los encabezados (`h1`–`h6`) |
| `--font-sans` | Hanken Grotesk | Cuerpo de texto, etiquetas de UI, botones |
| `--font-mono` | JetBrains Mono | Bloques de código |

Para cambiar fuentes:

1. Reemplaza la etiqueta `<link>` en `src/layouts/Layout.astro` con la URL de tu fuente de Google Fonts.
2. Actualiza las variables de fuente en el bloque `@theme`:

```css
@theme {
  --font-sans:    "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-display: "Playfair Display", ui-serif, Georgia, serif;
}
```

---

## Modo oscuro

La plantilla tiene el modo oscuro activado por defecto. El componente `ThemeSwitcher` alterna una clase `.dark` en `<html>` y guarda la elección en `localStorage`.

Para establecer el **modo claro** como predeterminado, cambia la etiqueta de apertura `<html>` en `src/layouts/Layout.astro`:

```html
<!-- modo oscuro predeterminado (original) -->
<html lang={lang} class="dark" style="color-scheme: dark;">

<!-- modo claro predeterminado -->
<html lang={lang} style="color-scheme: light;">
```

También actualiza el `<script is:inline>` de inicialización del tema en el mismo archivo para que use `"light"` en lugar de `"dark"` como valor de reserva.

---

## Secciones

Cada archivo en `src/sections/` es independiente. Para añadir o eliminar secciones, edita el archivo de página:

```astro
<!-- src/pages/index.astro -->
<main id="main-content">
  <Hero lang={lang} />
  <!-- elimina una sección borrando la línea -->
  <div class="scroll-reveal"><Features /></div>
  <!-- añade una sección importándola y colocándola aquí -->
  <div class="scroll-reveal"><MyNewSection /></div>
</main>
```

### Secciones disponibles

| Componente | Ideal para |
|-----------|-----------|
| `Hero.astro` | Landing de SaaS / producto — centrado con malla de luz |
| `HeroV2.astro` | Portafolio — diseño dividido con imagen grande |
| `HeroV3.astro` | Agencia / servicios — tipografía bold a todo ancho |
| `HeroV4.astro` | B2B / lujo — cuadrícula suiza minimalista, alineada a la izquierda |
| `HeroMarquee.astro` | Estudio creativo — fondo de imágenes con desplazamiento diagonal |
| `LogoBar.astro` | Tira de logos de clientes (desplazamiento automático) |
| `Features.astro` | Tarjetas de características en tres columnas |
| `CodeShowcase.astro` | Bloque de código con pestañas y columna de copiado |
| `ProcessSteps.astro` | Línea de tiempo de proceso numerada |
| `Stats.astro` | Tira de cifras clave |
| `TwoColumn.astro` | Dos columnas flexibles con viñetas y CTA |
| `Services.astro` | Cuadrícula de tarjetas de servicios |
| `About.astro` | Sección "Acerca de" con cuadrícula de imágenes y tarjetas de características |
| `Team.astro` | Tarjetas de miembros del equipo |
| `Gallery.astro` | Galería de imágenes con marquesina horizontal |
| `Testimonials.astro` | Cuadrícula de reseñas en mampostería |
| `Pricing.astro` | Tarjetas de planes de precios |
| `CTABanner.astro` | Banner de llamada a la acción a todo ancho |
| `Faq.astro` | Encabezado fijo + acordeón de preguntas frecuentes |
| `BlogGrid.astro` | Cuadrícula de las últimas entradas |
| `Newsletter.astro` | Formulario de captación de correo electrónico |
| `Contact.astro` | Formulario de contacto con barra lateral de información del estudio |

---

## Barra de navegación transparente

Pasa `transparentHeader={true}` a `Layout` para que la barra de navegación comience completamente transparente y aplique un efecto blur al desplazarse. Úsalo cuando el hero se extienda detrás de la navegación:

```astro
<Layout lang={lang} transparentHeader={true}>
```

Para `home-5` (el hero con marquesina), añade también `mobileSolidHeader={true}` — esto le da al fila del botón hamburguesa un fondo sólido en pantallas móviles donde el fondo de imagen hace que los iconos sean ilegibles:

```astro
<Layout lang={lang} transparentHeader={true} mobileSolidHeader={true}>
```

---

## Revelación al hacer scroll

Envuelve cualquier sección o elemento en `class="scroll-reveal"` para obtener una entrada con fundido y deslizamiento hacia arriba al entrar en el viewport. Escala los hijos con `delay-1` hasta `delay-6`:

```astro
<p class="scroll-reveal section-label">Etiqueta</p>
<h2 class="scroll-reveal delay-1">Encabezado</h2>
<p class="scroll-reveal delay-2">Cuerpo de texto</p>
```

El observer se ejecuta en `Layout.astro`. La animación se omite cuando `prefers-reduced-motion` está activo.
