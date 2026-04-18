---
title: Configuración del Tema
description: Personaliza fuentes, colores de marca, bordes redondeados y tu logotipo desde un único archivo — src/config/theme.ts.
---

Todos los aspectos visuales del starter — colores de marca, fuentes, bordes redondeados y logotipo — se controlan desde un único archivo:

```
src/config/theme.ts
```

Edita ese archivo y todos los componentes del sitio se actualizan automáticamente. Nunca necesitas tocar `globals.css` ni `Layout.astro`.

---

## Logotipo

```ts
logo: {
  light: null,          // ruta en public/, ej. "/logo.svg"
  dark:  null,          // ej. "/logo-dark.svg" — usa light si es null
  alt:   "Studio",      // texto alternativo accesible
  class: "h-8 w-auto",  // clase Tailwind que controla el tamaño
},
```

Coloca tus archivos de logotipo en el directorio `public/` y establece las rutas:

```ts
logo: {
  light: "/logo.svg",
  dark:  "/logo-dark.svg",
  alt:   "Acme Studio",
  class: "h-7 w-auto",
},
```

Cuando `light` es `null`, se muestra el logomark SVG inline por defecto. Si `dark` es `null`, el logotipo claro se usa en ambos modos de color.

---

## Fuentes

```ts
fonts: {
  googleFontsUrl: "https://fonts.googleapis.com/css2?...",
  sans:    '"Hanken Grotesk", ui-sans-serif, system-ui, sans-serif',
  display: '"Instrument Serif", ui-serif, Georgia, serif',
  mono:    '"JetBrains Mono", ui-monospace, monospace',
},
```

**Para cambiar las fuentes:**

1. Ve a [fonts.google.com](https://fonts.google.com), selecciona tus fuentes y copia la URL de la hoja de estilos.
2. Pégala en `googleFontsUrl`.
3. Actualiza los strings de familia `sans`, `display` y `mono` para que coincidan.

```ts
fonts: {
  googleFontsUrl:
    "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap",
  sans:    '"DM Sans", ui-sans-serif, system-ui, sans-serif',
  display: '"DM Serif Display", ui-serif, Georgia, serif',
  mono:    '"JetBrains Mono", ui-monospace, monospace',  // mono no cambia
},
```

| Rol | Usado para | Por defecto |
|-----|-----------|-------------|
| `sans` | Texto del cuerpo, etiquetas, botones, UI | Hanken Grotesk |
| `display` | Todos los encabezados (`h1`–`h6`) | Instrument Serif |
| `mono` | Bloques de código | JetBrains Mono |

---

## Bordes redondeados

```ts
radius: {
  xl: "0.75rem",   // tarjetas, modales, contenedores grandes
  lg: "0.5rem",    // botones, inputs, imágenes
  md: "0.375rem",  // badges, tooltips, componentes pequeños
  sm: "0.25rem",   // checkboxes, toggles, elementos diminutos
},
```

Estos valores se aplican directamente a las utilidades `rounded-*` de Tailwind. Algunos ejemplos de escalas:

| Estilo | xl | lg | md | sm |
|--------|----|----|----|----|
| Geométrico / sin redondeo | `0` | `0` | `0` | `0` |
| Sutil (por defecto) | `0.75rem` | `0.5rem` | `0.375rem` | `0.25rem` |
| Redondeado | `1.25rem` | `0.875rem` | `0.625rem` | `0.375rem` |
| Píldora | `9999px` | `9999px` | `9999px` | `9999px` |

---

## Colores

Los colores usan el [espacio de color OKLCH](https://oklch.com) — perceptualmente uniforme, de modo que los pares claro/oscuro siempre se ven armoniosos. El formato es `"oklch(L% C H)"`:

- **L** — Luminosidad (0% = negro, 100% = blanco)
- **C** — Croma (0 = gris, más alto = más vívido)
- **H** — Ángulo de tono (0–360 — rojo → verde → azul → rojo)

```ts
colors: {
  light: {
    primary:           "oklch(49%  0.100 183)",  // color de marca principal
    primaryForeground: "oklch(100% 0     0  )",  // texto sobre botones primarios
    accent:            "oklch(55%  0.110 42 )",  // segundo color de énfasis
    accentForeground:  "oklch(100% 0     0  )",
    background:        "oklch(99%  0.004 155)",
    foreground:        "oklch(14%  0.015 183)",
    // … conjunto completo en theme.ts
  },
  dark: {
    primary:           "oklch(65%  0.095 183)",  // más claro para fondo oscuro
    // …
  },
},
```

### Cambiar el color de marca

La mayoría de los rebrands solo necesitan dos valores: `primary` (claro) y `primary` (oscuro).

1. Encuentra tu color hexadecimal en [oklch.com](https://oklch.com) — pega el hex y copia el resultado OKLCH.
2. Para la variante oscura, mantén el mismo **H** y **C** pero aumenta **L** unos 15–20 puntos.

```ts
// Ejemplo: color de marca #2563eb (azul)
colors: {
  light: {
    primary:           "oklch(52% 0.220 264)",
    primaryForeground: "oklch(100% 0 0)",
    ring:              "oklch(52% 0.220 264)",
    // mantén el resto igual
  },
  dark: {
    primary:           "oklch(68% 0.200 264)",  // mismo H/C, L más alto
    ring:              "oklch(68% 0.200 264)",
    // mantén el resto igual
  },
},
```

### Referencia completa de tokens de color

| Token | Uso |
|-------|-----|
| `primary` / `primaryForeground` | Botones, estados activos, anillos de foco |
| `accent` / `accentForeground` | Etiquetas de sección, resaltados hover, tags |
| `background` / `foreground` | Fondo de página y texto por defecto |
| `card` / `cardForeground` | Superficies de tarjetas y paneles |
| `muted` / `mutedForeground` | Fondos sutiles, texto placeholder |
| `border` | Divisores, bordes de inputs, contornos de tarjetas |
| `input` | Color de borde de campos de entrada |
| `ring` | Color del contorno de foco por teclado |
| `surface` / `surfaceMuted` | Superposiciones hero, fondos de bloques de código |
| `destructive` / `destructiveForeground` | Estados de error, confirmaciones de eliminación |

---

## Cómo funciona

`Layout.astro` llama a `buildThemeCSS()` en tiempo de build e inyecta el resultado como bloque `<style>` al inicio de `<head>`:

```html
<style>
  :root {
    --font-sans: "Hanken Grotesk", …;
    --color-primary: oklch(49% 0.100 183);
    --radius-lg: 0.5rem;
    /* … todos los tokens … */
  }
  .dark {
    --color-primary: oklch(65% 0.095 183);
    /* … */
  }
</style>
```

Las clases de utilidad de Tailwind v4 referencian estas variables en tiempo de ejecución (`bg-primary` → `background-color: var(--color-primary)`), de modo que todos los componentes del sitio heredan los nuevos valores sin ningún paso de reconstrucción de Tailwind.

El bloque `@theme` en `globals.css` sigue existiendo — registra los nombres de los tokens para que Tailwind genere las clases de utilidad. Pero los valores reales vienen de `theme.ts`, no de ese archivo.
