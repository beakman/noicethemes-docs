---
title: Payload CMS v3
description: Conecta el starter a Payload CMS v3 — colecciones en TypeScript, autenticación con clave de API, renderizado de contenido Lexical y deploy hooks.
---

Payload CMS v3 es un CMS headless orientado al código — las colecciones se definen en TypeScript, no en una interfaz de administración. Esta guía crea las colecciones Articles y Authors, configura la autenticación con clave de API para la compilación de Astro y conecta un deploy hook para recompilaciones automáticas.

---

## 1. Instalar Payload CMS v3

```bash
npx create-payload-app@latest my-cms
cd my-cms
```

Elige una base de datos (SQLite para desarrollo local, PostgreSQL para producción) y confirma que quieres la plantilla en blanco. Payload arranca en `http://localhost:3000`.

---

## 2. Definir la colección Articles

Crea o edita `src/collections/Articles.ts`:

```ts
import type { CollectionConfig } from "payload";

export const Articles: CollectionConfig = {
  slug: "articles",
  admin: { useAsTitle: "title" },
  versions: { drafts: true },
  fields: [
    { name: "title",       type: "text",         required: true },
    { name: "slug",        type: "text",         required: true, unique: true, admin: { position: "sidebar" } },
    { name: "description", type: "textarea",     required: true },
    { name: "content",     type: "richText" },   // Editor Lexical
    { name: "cover",       type: "upload",       relationTo: "media" },
    { name: "pubDate",     type: "date",         required: true, admin: { position: "sidebar" } },
    { name: "tags",        type: "array",        fields: [{ name: "tag", type: "text" }] },
    { name: "author",      type: "relationship", relationTo: "authors", hasMany: false },
  ],
};
```

---

## 3. Definir la colección Authors

Crea `src/collections/Authors.ts`:

```ts
import type { CollectionConfig } from "payload";

export const Authors: CollectionConfig = {
  slug: "authors",
  auth: { useAPIKey: true },   // habilita la autenticación con clave de API para el acceso de compilación
  admin: { useAsTitle: "name" },
  fields: [
    { name: "name",    type: "text",   required: true },
    { name: "slug",    type: "text",   required: true, unique: true },
    { name: "role",    type: "text" },
    { name: "bio",     type: "textarea" },
    { name: "avatar",  type: "upload", relationTo: "media" },
    { name: "website", type: "text" },
  ],
};
```

Configurar `auth: { useAPIKey: true }` en la colección Authors genera una clave de API por usuario que usa la compilación de Astro para autenticarse. Esto es más seguro que almacenar una contraseña en variables de entorno.

---

## 4. Registrar las colecciones en `payload.config.ts`

```ts
import { buildConfig } from "payload";
import { Articles } from "./src/collections/Articles";
import { Authors }   from "./src/collections/Authors";
import { Media }     from "./src/collections/Media";
import { Users }     from "./src/collections/Users";

export default buildConfig({
  collections: [Articles, Authors, Media, Users],
  // ... resto de la configuración
});
```

---

## 5. Crear una clave de API

En el Admin de Payload → **Authors → Create Author**. Rellena el nombre y el cargo, luego despliega la sección **API Key** y haz clic en **Generate API Key**. Copia la clave.

```bash
# .env.local
PAYLOAD_URL=http://localhost:3000
PAYLOAD_API_KEY=your-api-key-here
```

> ⚠️ Nunca confirmes `.env.local`. Añade las variables en el panel de tu proveedor de alojamiento.

---

## 6. Crear el loader de Astro

Crea `src/lib/loaders/payload.ts`:

```ts
import type { Loader } from "astro/loaders";

export function payloadBlogLoader(): Loader {
  return {
    name: "payload-blog",
    async load({ store, logger }) {
      const base  = import.meta.env.PAYLOAD_URL  ?? "http://localhost:3000";
      const key   = import.meta.env.PAYLOAD_API_KEY;
      if (!key) throw new Error("PAYLOAD_API_KEY is required");

      const res = await fetch(
        `${base}/api/articles?depth=2&where[_status][equals]=published&sort=-pubDate&limit=100`,
        { headers: { Authorization: `users API-Key ${key}` } }
      );
      if (!res.ok) throw new Error(`Payload fetch failed: ${res.status}`);

      const { docs } = await res.json();
      store.clear();

      for (const item of docs) {
        const coverUrl = item.cover?.url
          ? `${base}${item.cover.url}`
          : undefined;

        store.set({
          id: item.slug,
          data: {
            title:       item.title,
            description: item.description,
            pubDate:     new Date(item.pubDate),
            cover:       coverUrl,
            author:      item.author?.slug ?? "unknown",
            tags:        (item.tags ?? []).map((t: { tag: string }) => t.tag),
            draft:       item._status !== "published",
          },
          // Almacena el JSON de Lexical para renderizarlo
          rendered: { html: JSON.stringify(item.content ?? {}) },
        });
      }

      logger.info(`Loaded ${docs.length} articles from Payload`);
    },
  };
}

export function payloadAuthorsLoader(): Loader {
  return {
    name: "payload-authors",
    async load({ store, logger }) {
      const base = import.meta.env.PAYLOAD_URL  ?? "http://localhost:3000";
      const key  = import.meta.env.PAYLOAD_API_KEY;
      if (!key) throw new Error("PAYLOAD_API_KEY is required");

      const res = await fetch(
        `${base}/api/authors?depth=1&limit=100`,
        { headers: { Authorization: `users API-Key ${key}` } }
      );
      if (!res.ok) throw new Error(`Payload authors fetch failed: ${res.status}`);

      const { docs } = await res.json();
      store.clear();

      for (const item of docs) {
        store.set({
          id: item.slug,
          data: {
            name:    item.name,
            role:    item.role   ?? "",
            bio:     item.bio    ?? "",
            avatar:  item.avatar?.url ? `${base}${item.avatar.url}` : undefined,
            website: item.website ?? undefined,
          },
        });
      }

      logger.info(`Loaded ${docs.length} authors from Payload`);
    },
  };
}
```

El encabezado `Authorization: users API-Key {key}` es específico de la estrategia de autenticación `useAPIKey` de Payload — observa el formato separado por espacios.

---

## 7. Actualizar `src/content.config.ts`

```ts
import { defineCollection, z } from "astro:content";
import { payloadBlogLoader, payloadAuthorsLoader } from "./lib/loaders/payload";

const blog = defineCollection({
  loader: payloadBlogLoader(),
  schema: z.object({
    title:       z.string(),
    description: z.string(),
    pubDate:     z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author:      z.string(),
    cover:       z.string().optional(),
    tags:        z.array(z.string()).default([]),
    draft:       z.boolean().default(false),
  }),
});

const authors = defineCollection({
  loader: payloadAuthorsLoader(),
  schema: z.object({
    name:    z.string(),
    role:    z.string(),
    bio:     z.string(),
    avatar:  z.string().optional(),
    website: z.string().url().optional(),
    twitter: z.string().optional(),
  }),
});

export const collections = { blog, authors };
```

---

## 8. Renderizar contenido Lexical

Instala el serializador HTML oficial de Lexical:

```bash
pnpm add @payloadcms/richtext-lexical
```

Luego en tu página de entrada de blog:

```ts
import { convertLexicalToHTML } from "@payloadcms/richtext-lexical/html";

// post.rendered.html es la cadena JSON almacenada por el loader
const lexicalJson = JSON.parse(post.rendered?.html ?? "{}");
const html = await convertLexicalToHTML({ data: lexicalJson });
```

```astro
<div class="prose dark:prose-invert max-w-none" set:html={html} />
```

---

## 9. Recompilación automática al publicar

Añade un hook `afterChange` a la colección Articles:

```ts
// src/collections/Articles.ts
hooks: {
  afterChange: [
    async ({ doc, operation }) => {
      if (doc._status === "published" && process.env.DEPLOY_HOOK_URL) {
        await fetch(process.env.DEPLOY_HOOK_URL, { method: "POST" });
      }
    },
  ],
},
```

Define `DEPLOY_HOOK_URL` con la URL de tu deploy hook de Vercel o Netlify en el archivo `.env` de Payload.
