---
title: Strapi v5
description: Reemplaza el loader de Markdown basado en archivos con un CMS Strapi v5 en tiempo real — esquema completo, loader tipado para Astro y revalidación mediante webhooks.
---

Esta guía reemplaza el loader `glob` en `src/content.config.ts` con un loader de la API de Strapi v5. Las páginas de blog, autores y categorías existentes siguen funcionando sin cambios porque la forma de los datos es idéntica.

---

## 1. Instalar Strapi v5

```bash
# Inicio rápido con SQLite (desarrollo)
npx create-strapi-app@latest my-cms --quickstart

# Con PostgreSQL (producción)
npx create-strapi-app@latest my-cms \
  --dbclient=postgres \
  --dbhost=localhost \
  --dbport=5432 \
  --dbname=starter_cms \
  --dbusername=postgres \
  --dbpassword=secret
```

Strapi arranca en `http://localhost:1337`. Crea tu cuenta de administrador y continúa.

---

## 2. Crear el tipo de colección Article

En el Admin de Strapi → **Content-Type Builder → Create new collection type**. Nómbralo `Article`, activa **Draft & Publish** y añade estos campos:

| Campo | Tipo | Requerido | Notas |
|-------|------|-----------|-------|
| `title` | String | ✓ | maxLength 255 |
| `slug` | UID | ✓ | Apunta a `title` — se genera automáticamente |
| `description` | Text | ✓ | maxLength 500 — meta descripción |
| `content` | Blocks | | Texto enriquecido de Strapi (JSON AST) |
| `cover` | Media | | Imagen única |
| `pubDate` | Datetime | ✓ | Fecha de publicación |
| `draft` | Boolean | | Por defecto `false` |
| `tags` | JSON | | Array de cadenas, p. ej. `["design","tips"]` |
| `author` | Relation | | Muchos-a-uno → Author |

<details>
<summary>schema.json completo</summary>

```json
{
  "kind": "collectionType",
  "collectionName": "articles",
  "info": { "singularName": "article", "pluralName": "articles", "displayName": "Article" },
  "options": { "draftAndPublish": true },
  "attributes": {
    "title":       { "type": "string", "required": true, "maxLength": 255 },
    "slug":        { "type": "uid", "targetField": "title", "required": true },
    "description": { "type": "text", "required": true, "maxLength": 500 },
    "content":     { "type": "blocks" },
    "cover":       { "type": "media", "multiple": false, "allowedTypes": ["images"] },
    "pubDate":     { "type": "datetime", "required": true },
    "draft":       { "type": "boolean", "default": false },
    "tags":        { "type": "json", "default": [] },
    "author":      { "type": "relation", "relation": "manyToOne", "target": "api::author.author" }
  }
}
```

</details>

---

## 3. Crear el tipo de colección Author

Crea una segunda colección llamada `Author` (sin Draft & Publish):

| Campo | Tipo | Notas |
|-------|------|-------|
| `name` | String | Requerido |
| `slug` | UID | Apunta a `name` — se usa como ID de colección |
| `role` | String | p. ej. "Lead Designer" |
| `bio` | Text | Biografía breve |
| `avatar` | Media | Imagen única |
| `website` | String | URL opcional |
| `twitter` | String | Identificador sin `@` |

---

## 4. Generar un token de API

Admin de Strapi → **Settings → API Tokens → Create new API Token**. Establece el tipo como **Read-only**, con alcance a `article` y `author`. Copia el token.

```bash
# .env.local
STRAPI_URL=http://localhost:1337
STRAPI_API_TOKEN=your-token-here
```

> ⚠️ Nunca confirmes `.env.local`. Añade estas variables en el panel de tu proveedor de alojamiento (Vercel → Proyecto → Settings → Environment Variables).

---

## 5. Crear el loader de Astro

Crea `src/lib/loaders/strapi.ts`:

```ts
import type { Loader } from "astro/loaders";

export function strapiBlogLoader(): Loader {
  return {
    name: "strapi-blog",
    async load({ store, logger }) {
      const base  = import.meta.env.STRAPI_URL  ?? "http://localhost:1337";
      const token = import.meta.env.STRAPI_API_TOKEN;

      const url =
        `${base}/api/articles` +
        `?populate[cover]=true` +
        `&populate[author][populate][avatar]=true` +
        `&sort=pubDate:desc` +
        `&pagination[pageSize]=100`;

      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error(`Strapi fetch failed: ${res.status}`);

      const { data } = await res.json();
      store.clear();

      for (const item of data) {
        store.set({
          id: item.slug,
          data: {
            title:       item.title,
            description: item.description,
            pubDate:     new Date(item.pubDate),
            cover:       item.cover ? `${base}${item.cover.url}` : undefined,
            author:      item.author?.slug ?? "unknown",
            tags:        item.tags ?? [],
            draft:       item.draft ?? false,
          },
          rendered: { html: JSON.stringify(item.content ?? []) },
        });
      }

      logger.info(`Loaded ${data.length} articles from Strapi`);
    },
  };
}

export function strapiAuthorsLoader(): Loader {
  return {
    name: "strapi-authors",
    async load({ store, logger }) {
      const base  = import.meta.env.STRAPI_URL  ?? "http://localhost:1337";
      const token = import.meta.env.STRAPI_API_TOKEN;

      const res = await fetch(
        `${base}/api/authors?populate[avatar]=true&pagination[pageSize]=100`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      if (!res.ok) throw new Error(`Strapi authors fetch failed: ${res.status}`);

      const { data } = await res.json();
      store.clear();

      for (const item of data) {
        store.set({
          id: item.slug,
          data: {
            name:    item.name,
            role:    item.role  ?? "",
            bio:     item.bio   ?? "",
            avatar:  item.avatar ? `${base}${item.avatar.url}` : undefined,
            website: item.website,
            twitter: item.twitter,
          },
        });
      }

      logger.info(`Loaded ${data.length} authors from Strapi`);
    },
  };
}
```

---

## 6. Actualizar `src/content.config.ts`

Reemplaza los loaders `glob` con los loaders de Strapi:

```ts
import { defineCollection, z } from "astro:content";
import { strapiBlogLoader, strapiAuthorsLoader } from "./lib/loaders/strapi";

const blog = defineCollection({
  loader: strapiBlogLoader(),
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
  loader: strapiAuthorsLoader(),
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

> ✓ **Nada más cambia.** Cada página que llama a `getCollection("blog")` sigue funcionando porque la forma de los datos coincide con el esquema existente.

---

## 7. Renderizar contenido de Strapi Blocks

El campo **Blocks** de Strapi v5 almacena texto enriquecido como un JSON AST. Crea `src/components/ui/StrapiBlocks.astro`:

```astro
---
interface Block {
  type: string;
  children: Array<{ type: string; text?: string; bold?: boolean; italic?: boolean; code?: boolean; url?: string; children?: unknown[] }>;
  level?: number;
  image?: { url: string; alternativeText: string };
}
interface Props { content: string | Block[] }
const { content } = Astro.props;
const blocks: Block[] = typeof content === "string" ? JSON.parse(content) : content;

function renderChildren(children: Block["children"]): string {
  return children.map((child) => {
    if (child.type === "link") return `<a href="${child.url}">${renderChildren(child.children as Block["children"])}</a>`;
    let text = child.text ?? "";
    if (child.bold)   text = `<strong>${text}</strong>`;
    if (child.italic) text = `<em>${text}</em>`;
    if (child.code)   text = `<code>${text}</code>`;
    return text;
  }).join("");
}
---
<div class="prose dark:prose-invert max-w-none">
  {blocks.map((block) => {
    if (block.type === "paragraph") return <p set:html={renderChildren(block.children)} />;
    if (block.type === "heading")   return <Fragment set:html={`<h${block.level}>${renderChildren(block.children)}</h${block.level}>`} />;
    if (block.type === "image")     return <img src={block.image?.url} alt={block.image?.alternativeText} class="rounded-xl" />;
    return null;
  })}
</div>
```

Para soporte completo de Blocks, considera usar `@strapi/blocks-react-renderer` envuelto en una isla de Astro.

---

## 8. Revalidación mediante webhook (opcional)

En el **Admin de Strapi → Settings → Webhooks**, añade la URL del deploy hook de tu proveedor de alojamiento. Cada vez que se publique contenido, Strapi enviará un POST a esa URL y activará una nueva compilación.

Para Vercel: Proyecto → Settings → Git → Deploy Hooks → Create Hook → copia la URL.

Para revalidación SSR bajo demanda, crea `src/pages/api/revalidate.ts`:

```ts
export const prerender = false;

export async function POST({ request }: { request: Request }) {
  const secret = import.meta.env.REVALIDATE_SECRET;
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  // En modo Astro SSR: import { refreshContent } from "astro:content"; await refreshContent();
  return Response.json({ revalidated: true });
}
```
