---
title: Payload CMS v3
description: Connect the starter to Payload CMS v3 — TypeScript collections, API key auth, Lexical content rendering, and deploy hooks.
---

Payload CMS v3 is a code-first headless CMS — collections are defined in TypeScript, not in an admin UI. This guide creates the Articles and Authors collections, sets up API key authentication for the Astro build, and wires up a deploy hook for automatic rebuilds.

---

## 1. Install Payload CMS v3

```bash
npx create-payload-app@latest my-cms
cd my-cms
```

Choose a database (SQLite for local dev, PostgreSQL for production) and confirm you want the blank template. Payload starts at `http://localhost:3000`.

---

## 2. Define the Articles collection

Create or edit `src/collections/Articles.ts`:

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
    { name: "content",     type: "richText" },   // Lexical editor
    { name: "cover",       type: "upload",       relationTo: "media" },
    { name: "pubDate",     type: "date",         required: true, admin: { position: "sidebar" } },
    { name: "tags",        type: "array",        fields: [{ name: "tag", type: "text" }] },
    { name: "author",      type: "relationship", relationTo: "authors", hasMany: false },
  ],
};
```

---

## 3. Define the Authors collection

Create `src/collections/Authors.ts`:

```ts
import type { CollectionConfig } from "payload";

export const Authors: CollectionConfig = {
  slug: "authors",
  auth: { useAPIKey: true },   // enables API key authentication for build access
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

Setting `auth: { useAPIKey: true }` on the Authors collection generates a per-user API key that the Astro build uses to authenticate. This is safer than storing a password in environment variables.

---

## 4. Register collections in `payload.config.ts`

```ts
import { buildConfig } from "payload";
import { Articles } from "./src/collections/Articles";
import { Authors }   from "./src/collections/Authors";
import { Media }     from "./src/collections/Media";
import { Users }     from "./src/collections/Users";

export default buildConfig({
  collections: [Articles, Authors, Media, Users],
  // ... rest of config
});
```

---

## 5. Create an API key

In Payload Admin → **Authors → Create Author**. Fill in the name and role, then expand the **API Key** section and click **Generate API Key**. Copy the key.

```bash
# .env.local
PAYLOAD_URL=http://localhost:3000
PAYLOAD_API_KEY=your-api-key-here
```

> ⚠️ Never commit `.env.local`. Add variables in your hosting dashboard.

---

## 6. Create the Astro loader

Create `src/lib/loaders/payload.ts`:

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
          // Store Lexical JSON for rendering
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

The `Authorization: users API-Key {key}` header is specific to Payload's `useAPIKey` auth strategy — note the space-separated format.

---

## 7. Update `src/content.config.ts`

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

## 8. Render Lexical content

Install the official Lexical HTML serializer:

```bash
pnpm add @payloadcms/richtext-lexical
```

Then in your blog post page:

```ts
import { convertLexicalToHTML } from "@payloadcms/richtext-lexical/html";

// post.rendered.html is the JSON string stored by the loader
const lexicalJson = JSON.parse(post.rendered?.html ?? "{}");
const html = await convertLexicalToHTML({ data: lexicalJson });
```

```astro
<div class="prose dark:prose-invert max-w-none" set:html={html} />
```

---

## 9. Automatic rebuild on publish

Add an `afterChange` hook to the Articles collection:

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

Set `DEPLOY_HOOK_URL` to your Vercel or Netlify build hook URL in your Payload `.env` file.
