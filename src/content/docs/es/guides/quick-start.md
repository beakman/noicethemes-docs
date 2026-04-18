---
title: Inicio Rápido
description: Clona la plantilla, instala las dependencias y ten un servidor de desarrollo funcionando en menos de 5 minutos.
---

Esta guía te lleva desde cero hasta un servidor de desarrollo local en funcionamiento.

## Requisitos previos

- **Node.js 20+** — comprueba con `node -v`
- **pnpm** — instala con `npm install -g pnpm` si no lo tienes

## 1. Clona el repositorio

```bash
git clone https://github.com/noicethemes/starter-template my-project
cd my-project
```

O descarga el ZIP desde la página de compra y extráelo.

## 2. Instala las dependencias

```bash
pnpm install
```

## 3. Inicia el servidor de desarrollo

```bash
pnpm dev
```

Abre [http://localhost:4321](http://localhost:4321) en tu navegador. El servidor admite reemplazo de módulos en caliente — los cambios en archivos `.astro`, `.ts` y `.css` se recargan al instante.

## 4. Primeras cosas que editar

### Metadatos del sitio — `src/config/site.ts`

Abre `src/config/site.ts` y actualiza `siteMeta` con tus propios valores:

```ts
export const siteMeta = {
  title: "My Studio",
  description: "A short description of your site for SEO.",
  baseUrl: "https://yourdomain.com",
  ogImage: "./assets/og-image.png",
  twitterCreator: "@yourhandle",
};
```

### Navegación y pie de página — `src/config.ts`

`src/config.ts` es el archivo central de re-exportación. Edita `mainMenu` y `footerLinks` directamente en ese archivo para cambiar las etiquetas y URLs de navegación.

### Traducciones — `src/locales/en/`

Todas las cadenas visibles por el usuario viven en los archivos JSON de `src/locales/en/`:

| Archivo | Contenido |
|---------|-----------|
| `common.json` | Etiquetas de navegación, texto del pie de página, banner de cookies, alternador de tema |
| `main.json` | Hero, estadísticas, sección "Acerca de", testimonios |
| `sections.json` | Todas las demás secciones (características, precios, FAQ, etc.) |

### Favicon — `public/favicon.svg`

Reemplaza `public/favicon.svg` con tu propio archivo de logo. Se recomienda SVG para una buena calidad en todos los tamaños.

## 5. Compilar para producción

```bash
pnpm build
```

Esto ejecuta `astro check` (verificación de tipos de TypeScript) seguido de `astro build`. El resultado se genera en `./dist/`.

## 6. Previsualizar la compilación de producción

```bash
pnpm preview
```

Sirve el directorio `dist/` localmente para que puedas verificar la compilación de producción antes de desplegar.

## Siguientes pasos

- [Estructura del Proyecto](/es/guides/project-structure/) — entiende cómo están organizados los archivos
- [Configuración](/es/guides/configuration/) — referencia completa de `src/config.ts` y los módulos de configuración
- [Personalización](/es/guides/customization/) — cambia colores, fuentes y secciones
- [Despliegue](/es/guides/deployment/) — publica en Vercel, Netlify o Cloudflare Pages
