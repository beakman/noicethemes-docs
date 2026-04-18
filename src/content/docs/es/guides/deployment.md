---
title: Despliegue
description: Despliega en Vercel, Netlify, Cloudflare Pages o cualquier servidor estático. Un solo comando y un directorio de compilación es todo lo que necesitas.
---

La plantilla se entrega como un **sitio completamente estático** (`output: "static"` es el valor predeterminado de Astro). El comando `pnpm build` produce un directorio `dist/` que puedes subir a cualquier servidor estático sin requisitos del lado del servidor.

---

## Antes de desplegar

```bash
# 1. Verifica que no haya errores de TypeScript
pnpm build

# 2. Previsualiza la compilación de producción localmente
pnpm preview
```

`pnpm build` ejecuta `astro check` (verificación de tipos) y luego `astro build`. Corrige cualquier error antes de publicar.

---

## Vercel

El camino más rápido. Conecta tu repositorio de GitHub en el panel de Vercel y Vercel detecta Astro automáticamente.

**Despliegue manual (CLI):**

```bash
npm install -g vercel   # instala una vez
vercel                  # primer despliegue — sigue las instrucciones
vercel --prod           # despliegues de producción posteriores
```

**Configuración a confirmar en el panel de Vercel:**

| Configuración | Valor |
|---------------|-------|
| Framework Preset | Astro |
| Build Command | `pnpm build` |
| Output Directory | `dist` |
| Node.js Version | 20.x |

**Variables de entorno:** Vercel → Proyecto → Settings → Environment Variables. Añade aquí `STRAPI_URL`, `DIRECTUS_URL`, etc. — nunca las confirmes en el repositorio.

---

## Netlify

**A través de la interfaz de Netlify:**

1. Conecta tu repositorio.
2. Define el comando de compilación: `pnpm build`
3. Define el directorio de publicación: `dist`
4. Define la variable de entorno `NODE_VERSION` en `20`.

**Mediante `netlify.toml`** (añádelo a la raíz del proyecto):

```toml
[build]
  command = "pnpm build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "20"
```

**Deploy hooks:** En Netlify → Site settings → Build & deploy → Build hooks, crea una URL de hook. Pégala en la configuración de webhooks de tu CMS para activar recompilaciones al publicar contenido.

---

## Cloudflare Pages

1. Inicia sesión en Cloudflare Dashboard → Pages → Create a project.
2. Conecta tu proveedor de Git y selecciona el repositorio.
3. Configura:

| Configuración | Valor |
|---------------|-------|
| Framework preset | Astro |
| Build command | `pnpm build` |
| Build output directory | `dist` |
| Environment variable | `NODE_VERSION = 20` |

4. Haz clic en **Save and Deploy**.

La CDN global de Cloudflare proporciona excelentes puntuaciones en Lighthouse con una configuración mínima.

---

## Servidor propio / servidor estático

Cualquier servidor que sirva archivos estáticos funciona (nginx, Apache, AWS S3 + CloudFront, Bunny CDN, etc.):

```bash
pnpm build
# Sube el directorio dist/ a tu servidor
```

**Ejemplo de configuración de nginx:**

```nginx
server {
  listen 80;
  root /var/www/my-site/dist;
  index index.html;

  # Fallback tipo SPA para el enrutamiento basado en archivos de Astro
  location / {
    try_files $uri $uri/ $uri.html =404;
  }
}
```

---

## Añadir SSR (renderizado del lado del servidor)

La plantilla es estática por defecto. Para activar SSR (necesario para envíos de formularios, autenticación o revalidación de CMS bajo demanda):

1. Instala un adaptador:

```bash
# Vercel
pnpm add @astrojs/vercel

# Netlify
pnpm add @astrojs/netlify

# Cloudflare
pnpm add @astrojs/cloudflare
```

2. Actualiza `astro.config.mjs`:

```ts
import vercel from "@astrojs/vercel/serverless";

export default defineConfig({
  output: "server",
  adapter: vercel(),
});
```

3. Las páginas que deben seguir siendo estáticas pueden excluirse individualmente:

```ts
// src/pages/about.astro
export const prerender = true;
```

---

## Variables de entorno

Las variables con el prefijo `PUBLIC_` se exponen al cliente. Todas las demás son solo del servidor:

```bash
# .env.local (nunca confirmes este archivo)
STRAPI_API_TOKEN=abc123          # solo servidor
PUBLIC_PLAUSIBLE_DOMAIN=you.com  # expuesta al cliente
```

Añade las mismas variables en el panel de tu proveedor de alojamiento para producción. El archivo `.env.local` ya está en `.gitignore`.
