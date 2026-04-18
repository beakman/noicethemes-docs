---
title: Directus 11
description: Conecta el starter a Directus 11 — snapshot de esquema, loader tipado para Astro, configuración de política de acceso y revalidación mediante webhooks con Flows.
---

Directus es un CMS headless de código abierto con una interfaz de administración muy cuidada. Esta guía aplica un snapshot de esquema para crear las colecciones `articles` y `authors`, y luego configura un loader de Astro que alimenta la misma forma de datos que esperan las páginas de blog existentes.

---

## 1. Instalar Directus 11

```bash
# Inicio rápido con SQLite (desarrollo)
npx create-directus-project@latest my-cms

# Docker Compose (producción — PostgreSQL)
# Descarga docker-compose.yml desde directus.io/docs
docker compose up -d
```

Directus arranca en `http://localhost:8055`. Crea tu cuenta de administrador en el primer arranque.

---

## 2. Aplicar el snapshot de esquema

Guarda el JSON a continuación como `schema-snapshot.json` en la raíz de tu proyecto Directus y aplícalo. Esto crea ambas colecciones con todos los campos y relaciones en un solo paso.

```bash
# Opción A — CLI de Directus
npx directus schema apply schema-snapshot.json

# Opción B — API REST
curl -X POST http://localhost:8055/schema/apply \
  -H "Authorization: Bearer your-admin-token" \
  -H "Content-Type: application/json" \
  -d @schema-snapshot.json
```

<details>
<summary>Ver schema-snapshot.json completo</summary>

```json
{
  "version": 1,
  "directus": "11.0.0",
  "collections": [
    { "collection": "articles", "meta": { "icon": "article", "display_template": "{{title}}", "archive_field": "status" }, "schema": { "name": "articles" } },
    { "collection": "authors",  "meta": { "icon": "person",  "display_template": "{{name}}" },  "schema": { "name": "authors"  } }
  ],
  "fields": [
    { "collection": "articles", "field": "id",          "type": "integer", "schema": { "is_primary_key": true }, "meta": { "hidden": true } },
    { "collection": "articles", "field": "status",      "type": "string",  "schema": { "default_value": "draft" }, "meta": { "interface": "select-dropdown", "options": { "choices": [{ "text": "Published", "value": "published" }, { "text": "Draft", "value": "draft" }] } } },
    { "collection": "articles", "field": "title",       "type": "string",  "schema": { "is_nullable": false }, "meta": { "interface": "input", "required": true } },
    { "collection": "articles", "field": "slug",        "type": "string",  "schema": { "is_unique": true, "is_nullable": false }, "meta": { "interface": "input", "required": true } },
    { "collection": "articles", "field": "description", "type": "text",    "meta": { "interface": "input-multiline", "required": true } },
    { "collection": "articles", "field": "content",     "type": "text",    "meta": { "interface": "input-rich-text-md" } },
    { "collection": "articles", "field": "cover",       "type": "uuid",    "schema": { "foreign_key_table": "directus_files" }, "meta": { "interface": "file-image", "special": ["file"] } },
    { "collection": "articles", "field": "pub_date",    "type": "timestamp","schema": { "is_nullable": false }, "meta": { "interface": "datetime", "required": true } },
    { "collection": "articles", "field": "tags",        "type": "alias",   "meta": { "interface": "tags", "special": ["cast-json"] } },
    { "collection": "articles", "field": "author",      "type": "integer", "schema": { "foreign_key_table": "authors" }, "meta": { "interface": "select-dropdown-m2o", "special": ["m2o"] } },
    { "collection": "authors",  "field": "id",          "type": "integer", "schema": { "is_primary_key": true }, "meta": { "hidden": true } },
    { "collection": "authors",  "field": "name",        "type": "string",  "schema": { "is_nullable": false }, "meta": { "interface": "input", "required": true } },
    { "collection": "authors",  "field": "slug",        "type": "string",  "schema": { "is_unique": true }, "meta": { "interface": "input", "required": true } },
    { "collection": "authors",  "field": "role",        "type": "string",  "meta": { "interface": "input" } },
    { "collection": "authors",  "field": "bio",         "type": "text",    "meta": { "interface": "input-multiline" } },
    { "collection": "authors",  "field": "avatar",      "type": "uuid",    "schema": { "foreign_key_table": "directus_files" }, "meta": { "interface": "file-image", "special": ["file"] } },
    { "collection": "authors",  "field": "website",     "type": "string",  "meta": { "interface": "input" } },
    { "collection": "authors",  "field": "twitter",     "type": "string",  "meta": { "interface": "input", "note": "Handle without @" } }
  ],
  "relations": [
    { "collection": "articles", "field": "author", "related_collection": "authors",        "schema": { "on_delete": "SET NULL" } },
    { "collection": "articles", "field": "cover",  "related_collection": "directus_files", "schema": { "on_delete": "SET NULL" } },
    { "collection": "authors",  "field": "avatar", "related_collection": "directus_files", "schema": { "on_delete": "SET NULL" } }
  ]
}
```

</details>

---

## 3. Referencia de campos

### articles

| Campo | Tipo | Interfaz | Notas |
|-------|------|----------|-------|
| `id` | Integer | — | PK autoincremental |
| `status` | String | select-dropdown | `published` / `draft` |
| `title` | String | input | Requerido |
| `slug` | String | input | Único — se mapea al ID de la colección |
| `description` | Text | input-multiline | Requerido |
| `content` | Text | input-rich-text-md | Markdown |
| `cover` | UUID | file-image | FK → directus_files |
| `pub_date` | Timestamp | datetime | Requerido — se mapea a `pubDate` |
| `tags` | JSON | tags | Array de cadenas |
| `author` | Integer | select-dropdown-m2o | FK → authors.id |

### authors

| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | Integer | PK autoincremental |
| `name` | String | Requerido |
| `slug` | String | Único — se mapea al ID de la colección |
| `role` | String | p. ej. "Lead Designer" |
| `bio` | Text | Biografía breve |
| `avatar` | UUID | FK → directus_files |
| `website` | String | URL opcional |
| `twitter` | String | Identificador sin `@` |

---

## 4. Crear una política de acceso de solo lectura

Nunca uses tu token de administrador en la compilación. Crea una política dedicada:

- Admin de Directus → **Settings → Access Policies → Create Policy**
- Nombre: `Astro Build`
- Permisos: `articles` (leer), `authors` (leer), `directus_files` (leer)

Luego crea un usuario de servicio:

- **Settings → Users → Create user** `astro-build@example.com`
- Asigna la política `Astro Build`
- Copia el **Static Token** desde la página de detalle del usuario

---

## 5. Variables de entorno

```bash
# .env.local
DIRECTUS_URL=http://localhost:8055
DIRECTUS_STATIC_TOKEN=your-static-token-here
```

> ⚠️ Nunca confirmes `.env.local`. Define estas variables en las variables de entorno de tu proveedor de alojamiento.

---

## 6. Crear el loader de Astro

Crea `src/lib/loaders/directus.ts`:

```ts
import type { Loader } from "astro/loaders";

export function directusBlogLoader(): Loader {
  return {
    name: "directus-blog",
    async load({ store, logger }) {
      const base  = import.meta.env.DIRECTUS_URL          ?? "http://localhost:8055";
      const token = import.meta.env.DIRECTUS_STATIC_TOKEN;
      if (!token) throw new Error("DIRECTUS_STATIC_TOKEN is required");

      const fields = [
        "id","status","title","slug","description","content","pub_date","tags",
        "cover.filename_disk",
        "author.id","author.name","author.slug","author.role","author.bio",
        "author.avatar.filename_disk",
      ].join(",");

      const res = await fetch(
        `${base}/items/articles?fields=${fields}&filter[status][_eq]=published&sort=-pub_date&limit=200`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error(`Directus fetch failed: ${res.status}`);

      const { data } = await res.json();
      store.clear();

      for (const item of data) {
        store.set({
          id: item.slug,
          data: {
            title:       item.title,
            description: item.description,
            pubDate:     new Date(item.pub_date),
            cover:       item.cover ? `${base}/assets/${item.cover.filename_disk}` : undefined,
            author:      item.author?.slug ?? "unknown",
            tags:        Array.isArray(item.tags) ? item.tags : [],
            draft:       item.status !== "published",
          },
          body: item.content ?? "",
        });
      }

      logger.info(`Loaded ${data.length} articles from Directus`);
    },
  };
}

export function directusAuthorsLoader(): Loader {
  return {
    name: "directus-authors",
    async load({ store, logger }) {
      const base  = import.meta.env.DIRECTUS_URL          ?? "http://localhost:8055";
      const token = import.meta.env.DIRECTUS_STATIC_TOKEN;
      if (!token) throw new Error("DIRECTUS_STATIC_TOKEN is required");

      const res = await fetch(
        `${base}/items/authors?fields=id,name,slug,role,bio,website,twitter,avatar.filename_disk&limit=200`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error(`Directus authors fetch failed: ${res.status}`);

      const { data } = await res.json();
      store.clear();

      for (const item of data) {
        store.set({
          id: item.slug,
          data: {
            name:    item.name,
            role:    item.role  ?? "",
            bio:     item.bio   ?? "",
            avatar:  item.avatar ? `${base}/assets/${item.avatar.filename_disk}` : undefined,
            website: item.website ?? undefined,
            twitter: item.twitter ?? undefined,
          },
        });
      }

      logger.info(`Loaded ${data.length} authors from Directus`);
    },
  };
}
```

---

## 7. Actualizar `src/content.config.ts`

```ts
import { defineCollection, z } from "astro:content";
import { directusBlogLoader, directusAuthorsLoader } from "./lib/loaders/directus";

const blog = defineCollection({
  loader: directusBlogLoader(),
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
  loader: directusAuthorsLoader(),
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

## 8. Recompilación automatizada con Flows

Los **Flows** de Directus pueden enviar un POST al deploy hook de tu proveedor de alojamiento cada vez que se publique un artículo:

- Admin → **Flows → Create Flow**
- Disparador: `Event Hook`, evento: `items.update`, alcance: `articles`
- Añade condición: `status == "published"`
- Operación: **Webhook / Request URL**, método: `POST`, URL: la URL de tu deploy hook de Vercel / Netlify
