---
title: Strapi v5
description: Replace the file-based Markdown loader with a live Strapi v5 CMS — full schema, typed Astro loader, and webhook revalidation.
---

This guide replaces the `glob` loader in `src/content.config.ts` with a Strapi v5 API loader. Your existing blog pages, author pages, and category pages continue to work unchanged because the data shape is identical.

---

## 1. Install Strapi v5

```bash
# Quickstart with SQLite (development)
npx create-strapi-app@latest my-cms --quickstart

# With PostgreSQL (production)
npx create-strapi-app@latest my-cms \
  --dbclient=postgres \
  --dbhost=localhost \
  --dbport=5432 \
  --dbname=starter_cms \
  --dbusername=postgres \
  --dbpassword=secret
```

Strapi starts at `http://localhost:1337`. Create your admin account, then continue.

---

## 2. Create the Article collection type

In Strapi Admin → **Content-Type Builder → Create new collection type**. Name it `Article`, enable **Draft & Publish**, and add these fields:

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `title` | String | ✓ | maxLength 255 |
| `slug` | UID | ✓ | Targets `title` — auto-generated |
| `description` | Text | ✓ | maxLength 500 — meta description |
| `content` | Blocks | | Strapi rich text (JSON AST) |
| `cover` | Media | | Single image |
| `pubDate` | Datetime | ✓ | Publication date |
| `draft` | Boolean | | Default `false` |
| `tags` | JSON | | Array of strings, e.g. `["design","tips"]` |
| `author` | Relation | | Many-to-one → Author |

<details>
<summary>Full schema.json</summary>

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

## 3. Create the Author collection type

Create a second collection named `Author` (no Draft & Publish):

| Field | Type | Notes |
|-------|------|-------|
| `name` | String | Required |
| `slug` | UID | Targets `name` — used as collection ID |
| `role` | String | e.g. "Lead Designer" |
| `bio` | Text | Short biography |
| `avatar` | Media | Single image |
| `website` | String | Optional URL |
| `twitter` | String | Handle without `@` |

---

## 4. Generate an API token

Strapi Admin → **Settings → API Tokens → Create new API Token**. Set type to **Read-only**, scope to `article` and `author`. Copy the token.

```bash
# .env.local
STRAPI_URL=http://localhost:1337
STRAPI_API_TOKEN=your-token-here
```

> ⚠️ Never commit `.env.local`. Add these variables in your hosting dashboard (Vercel → Project → Settings → Environment Variables).

---

## 5. Create the Astro loader

Create `src/lib/loaders/strapi.ts`:

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

## 6. Update `src/content.config.ts`

Replace the `glob` loaders with the Strapi loaders:

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

> ✓ **Nothing else changes.** Every page that calls `getCollection("blog")` continues to work because the data shape matches the existing schema.

---

## 7. Render Strapi Blocks content

Strapi v5's **Blocks** field stores rich text as a JSON AST. Create `src/components/ui/StrapiBlocks.astro`:

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

For full Blocks support, consider `@strapi/blocks-react-renderer` wrapped in an Astro island.

---

## 8. Webhook revalidation (optional)

In **Strapi Admin → Settings → Webhooks**, add your hosting provider's deploy hook URL. Every time content is published, Strapi will POST to that URL and trigger a fresh build.

For Vercel: Project → Settings → Git → Deploy Hooks → Create Hook → copy the URL.

For on-demand SSR revalidation, create `src/pages/api/revalidate.ts`:

```ts
export const prerender = false;

export async function POST({ request }: { request: Request }) {
  const secret = import.meta.env.REVALIDATE_SECRET;
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  // In Astro SSR mode: import { refreshContent } from "astro:content"; await refreshContent();
  return Response.json({ revalidated: true });
}
```
