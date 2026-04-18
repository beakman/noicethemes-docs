---
title: Directus 11
description: Connect the starter to Directus 11 — schema snapshot, typed Astro loader, access policy setup, and Flows-based webhook revalidation.
---

Directus is an open-source headless CMS with a polished admin UI. This guide applies a schema snapshot to create the `articles` and `authors` collections, then wires up an Astro loader that feeds the same data shape the existing blog pages expect.

---

## 1. Install Directus 11

```bash
# Quickstart with SQLite (development)
npx create-directus-project@latest my-cms

# Docker Compose (production — PostgreSQL)
# Download docker-compose.yml from directus.io/docs
docker compose up -d
```

Directus starts at `http://localhost:8055`. Create your admin account on first run.

---

## 2. Apply the schema snapshot

Save the JSON below as `schema-snapshot.json` at the root of your Directus project, then apply it. This creates both collections with all fields and relations in one step.

```bash
# Option A — Directus CLI
npx directus schema apply schema-snapshot.json

# Option B — REST API
curl -X POST http://localhost:8055/schema/apply \
  -H "Authorization: Bearer your-admin-token" \
  -H "Content-Type: application/json" \
  -d @schema-snapshot.json
```

<details>
<summary>View full schema-snapshot.json</summary>

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

## 3. Field reference

### articles

| Field | Type | Interface | Notes |
|-------|------|-----------|-------|
| `id` | Integer | — | Auto-increment PK |
| `status` | String | select-dropdown | `published` / `draft` |
| `title` | String | input | Required |
| `slug` | String | input | Unique — maps to collection ID |
| `description` | Text | input-multiline | Required |
| `content` | Text | input-rich-text-md | Markdown |
| `cover` | UUID | file-image | FK → directus_files |
| `pub_date` | Timestamp | datetime | Required — maps to `pubDate` |
| `tags` | JSON | tags | Array of strings |
| `author` | Integer | select-dropdown-m2o | FK → authors.id |

### authors

| Field | Type | Notes |
|-------|------|-------|
| `id` | Integer | Auto-increment PK |
| `name` | String | Required |
| `slug` | String | Unique — maps to collection ID |
| `role` | String | e.g. "Lead Designer" |
| `bio` | Text | Short biography |
| `avatar` | UUID | FK → directus_files |
| `website` | String | Optional URL |
| `twitter` | String | Handle without `@` |

---

## 4. Create a read-only access policy

Never use your admin token in the build. Create a dedicated policy:

- Directus Admin → **Settings → Access Policies → Create Policy**
- Name: `Astro Build`
- Permissions: `articles` (read), `authors` (read), `directus_files` (read)

Then create a service user:

- **Settings → Users → Create user** `astro-build@example.com`
- Assign the `Astro Build` policy
- Copy the **Static Token** from the user detail page

---

## 5. Environment variables

```bash
# .env.local
DIRECTUS_URL=http://localhost:8055
DIRECTUS_STATIC_TOKEN=your-static-token-here
```

> ⚠️ Never commit `.env.local`. Set these in your hosting provider's environment variables.

---

## 6. Create the Astro loader

Create `src/lib/loaders/directus.ts`:

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

## 7. Update `src/content.config.ts`

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

## 8. Automated rebuild with Flows

Directus **Flows** can POST to your hosting provider's deploy hook every time an article is published:

- Admin → **Flows → Create Flow**
- Trigger: `Event Hook`, event: `items.update`, scope: `articles`
- Add condition: `status == "published"`
- Operation: **Webhook / Request URL**, method: `POST`, URL: your Vercel / Netlify deploy hook URL
