---
title: Adaptadores SSR
description: Cambia de una compilación completamente estática a renderizado en el servidor con un adaptador de Vercel, Netlify, Cloudflare o Node.js — y usa el modo híbrido para mantener la mayoría de páginas estáticas.
---

La plantilla se entrega como **sitio estático** (`output: "static"`) por defecto — cada página se pre-renderiza en tiempo de compilación y se sirve como HTML plano. Esto cubre la mayoría de los casos de uso. Cuando necesitas lógica del lado del servidor (una ruta API para el formulario de contacto, páginas protegidas con autenticación, revalidación del CMS bajo demanda, personalización), añades un **adaptador** y cambias al modo de salida `"server"` o `"hybrid"`.

- **Docs oficiales de Astro:** [docs.astro.build/en/guides/on-demand-rendering](https://docs.astro.build/en/guides/on-demand-rendering/)
- **Lista de adaptadores:** [docs.astro.build/en/guides/integrations-guide](https://docs.astro.build/en/guides/integrations-guide/#official-integrations)

---

## Modos de salida

| Modo | Comportamiento | Cuándo usarlo |
|------|---------------|---------------|
| `"static"` (predeterminado) | Todas las páginas pre-renderizadas en tiempo de compilación. No requiere servidor. | Sitios de contenido puro, blogs, landing pages |
| `"hybrid"` | Estático por defecto. Las rutas individuales activan el renderizado de servidor con `export const prerender = false`. | Principalmente estático con algunos endpoints dinámicos (p.ej. una ruta API para el formulario de contacto) |
| `"server"` | Todas las rutas se renderizan en el servidor por defecto. Las rutas individuales se excluyen con `export const prerender = true`. | Aplicaciones con autenticación, personalización intensa, sitios muy dinámicos |

Para esta plantilla, **`"hybrid"`** es la elección correcta en la mayoría de los casos — mantienes todas las páginas estáticas y solo añades renderizado de servidor para las rutas API específicas que crees.

---

## Vercel

**Instalación:**

```bash
pnpm add @astrojs/vercel
```

**`astro.config.mjs`:**

```ts
import { defineConfig } from "astro/config";
import vercel from "@astrojs/vercel";

export default defineConfig({
  output: "hybrid",   // o "server"
  adapter: vercel(),
});
```

Despliega haciendo push a tu repositorio de GitHub conectado o ejecutando `vercel --prod`. Vercel detecta automáticamente el adaptador y enruta el tráfico de funciones serverless al handler correcto.

- **Docs:** [docs.astro.build/en/guides/integrations-guide/vercel](https://docs.astro.build/en/guides/integrations-guide/vercel/)
- **Edge functions:** Pasa `{ edgeMiddleware: true }` a `vercel()` para ejecutar middleware en Vercel Edge en lugar de Node.js serverless.

:::note
El paquete `@astrojs/vercel` reemplaza la antigua ruta de importación `@astrojs/vercel/serverless`. Usa la importación directa mostrada arriba para Astro 5+.
:::

---

## Netlify

**Instalación:**

```bash
pnpm add @astrojs/netlify
```

**`astro.config.mjs`:**

```ts
import { defineConfig } from "astro/config";
import netlify from "@astrojs/netlify";

export default defineConfig({
  output: "hybrid",
  adapter: netlify(),
});
```

Las rutas de servidor se despliegan automáticamente como Netlify Functions. No se necesitan cambios en `netlify.toml` más allá de lo que ya cubre la [guía de Despliegue](/es/guides/deployment/).

- **Docs:** [docs.astro.build/en/guides/integrations-guide/netlify](https://docs.astro.build/en/guides/integrations-guide/netlify/)
- **Edge functions:** Pasa `{ edgeMiddleware: true }` a `netlify()` para ejecutar middleware en Netlify Edge.

---

## Cloudflare Pages

**Instalación:**

```bash
pnpm add @astrojs/cloudflare
```

**`astro.config.mjs`:**

```ts
import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  output: "hybrid",
  adapter: cloudflare(),
});
```

Las rutas de servidor se ejecutan como **Cloudflare Workers** en el edge — extremadamente rápidos, con latencia global. El runtime de Cloudflare no es Node.js, por lo que algunas APIs específicas de Node (`fs`, `crypto`) no están disponibles. Usa la [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) y alternativas estándar de la web en su lugar.

- **Docs:** [docs.astro.build/en/guides/integrations-guide/cloudflare](https://docs.astro.build/en/guides/integrations-guide/cloudflare/)
- **Bindings (KV, D1, R2):** Accede a los bindings de Cloudflare mediante `Astro.locals.runtime.env` en archivos `.astro` o `context.locals.runtime.env` en rutas API.

---

## Node.js (auto-alojado)

Usa este adaptador cuando despliegues en un VPS, contenedor Docker o cualquier entorno donde ejecutes un proceso Node.js directamente.

**Instalación:**

```bash
pnpm add @astrojs/node
```

**`astro.config.mjs`:**

```ts
import { defineConfig } from "astro/config";
import node from "@astrojs/node";

export default defineConfig({
  output: "hybrid",
  adapter: node({ mode: "standalone" }),
});
```

`mode: "standalone"` produce un servidor Node.js autocontenido en `dist/server/entry.mjs`. Inícialo con:

```bash
pnpm build
node dist/server/entry.mjs
```

Establece las variables de entorno `PORT` y `HOST` para controlar dónde escucha (valores predeterminados: `3000` / `0.0.0.0`).

- **Docs:** [docs.astro.build/en/guides/integrations-guide/node](https://docs.astro.build/en/guides/integrations-guide/node/)
- **Modo middleware:** Usa `mode: "middleware"` para montar la aplicación Astro dentro de un servidor Express o Fastify existente.

---

## El modo híbrido en la práctica

Una vez que hayas añadido un adaptador y establecido `output: "hybrid"`, todas las páginas existentes siguen siendo completamente estáticas — nada se rompe. Solo añades renderizado de servidor donde lo necesitas explícitamente.

**Activar el renderizado de servidor en una ruta:**

```ts
// src/pages/api/contact.ts  — ruta API renderizada en el servidor
export const prerender = false;

export const POST: APIRoute = async ({ request }) => { /* ... */ };
```

**Confirmar que una página sigue siendo estática:**

```ts
// src/pages/index.astro — estático (prerender = true es el valor predeterminado en hybrid)
// No se necesita ningún export — estático es automático en modo hybrid.
```

**Configuración híbrida típica para esta plantilla:**

```
src/pages/
├── index.astro            → estático  (predeterminado)
├── about/                 → estático  (predeterminado)
├── blog/                  → estático  (predeterminado)
└── api/
    ├── contact.ts         → servidor  (export const prerender = false)
    └── revalidate.ts      → servidor  (export const prerender = false)
```

---

## Variables de entorno en SSR

Las variables de entorno del lado del servidor (sin prefijo `PUBLIC_`) solo están disponibles en rutas renderizadas en el servidor — nunca en páginas estáticas. Nunca se envían al navegador.

```ts
// src/pages/api/contact.ts
const apiKey = import.meta.env.RESEND_API_KEY;   // ✓ disponible en ruta de servidor
```

```astro
---
// src/pages/index.astro (página estática)
const apiKey = import.meta.env.RESEND_API_KEY;   // ✗ undefined — no uses claves privadas en páginas estáticas
---
```

Añade siempre las variables exclusivas del servidor en la configuración de entorno de tu proveedor de hosting (Vercel → Project → Settings → Environment Variables), no solo en `.env.local`.
