---
title: Blog & Content
description: How to create and manage blog posts and author profiles using Astro's Content Collections Loader API.
---

The blog uses Astro's **Loader API** (introduced in Astro 4.14, stable in v5+). Blog posts and author profiles are Markdown files read from `src/data/` at build time. There is no database — just files.

---

## File locations

```
src/data/
├── blog/
│   ├── my-first-post.md
│   └── another-article.mdx
└── authors/
    └── jane-doe.md
```

---

## Writing a blog post

Create a new `.md` or `.mdx` file in `src/data/blog/`. The filename becomes the post slug.

```markdown
---
title: "A Complete Guide to Brand Identity"
description: "Everything you need to know about building a strong, consistent brand."
pubDate: 2025-04-01
author: jane-doe          # must match a filename in src/data/authors/
cover: ../../assets/blog/brand-identity.jpg
tags: ["branding", "design", "strategy"]
draft: false
---

Your post content here in Markdown...
```

### Frontmatter fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | `string` | ✓ | Post title — shown in listings and `<title>` |
| `description` | `string` | ✓ | Short summary — used as meta description |
| `pubDate` | `Date` | ✓ | Publication date (`YYYY-MM-DD`) |
| `updatedDate` | `Date` | | Last update date — shown if set |
| `author` | `string` | | Author slug — must match `src/data/authors/{slug}.md` |
| `cover` | `image()` | | Cover image — use a relative path from the post file |
| `tags` | `string[]` | | Array of tag strings — drives category pages |
| `draft` | `boolean` | | Default `false` — drafts are excluded from production builds |

### Images

Place cover images in `src/assets/blog/` and reference them with a relative path:

```yaml
cover: ../../assets/blog/my-image.jpg
```

Astro will optimise them (WebP conversion, responsive `srcset`) automatically.

---

## Writing an author profile

Create a `.md` file in `src/data/authors/`. The filename is the author slug used in post frontmatter.

```markdown
---
name: "Jane Doe"
role: "Creative Director"
bio: "Jane has led brand projects for Fortune 500 companies for over a decade."
avatar: ../../assets/authors/jane-doe.jpg
website: "https://janedoe.com"
twitter: "janedoe"
draft: false
---
```

### Author frontmatter fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | ✓ | Full display name |
| `role` | `string` | ✓ | Job title or specialty |
| `bio` | `string` | ✓ | Short biography (1–2 sentences) |
| `avatar` | `image()` | | Profile photo — relative path from the file |
| `website` | `string` | | Full URL including `https://` |
| `twitter` | `string` | | Handle without `@` |
| `draft` | `boolean` | | Hides the author from listings if `true` |

---

## Blog pages

| Route | File | Description |
|-------|------|-------------|
| `/blog` | `src/pages/blog/index.astro` | Paginated listing of all published posts |
| `/blog/[slug]` | `src/pages/blog/[...slug].astro` | Individual post page |
| `/blog/authors` | `src/pages/blog/authors/index.astro` | All authors listing |
| `/blog/authors/[slug]` | `src/pages/blog/authors/[slug].astro` | Author profile + their posts |
| `/blog/categories/[tag]` | `src/pages/blog/categories/[tag].astro` | Posts filtered by tag |

---

## Content schema (`src/content.config.ts`)

The schema validates frontmatter at build time using Zod. If a post has an invalid field, the build fails with a clear error.

```ts
const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/data/blog" }),
  schema: ({ image }) => z.object({
    title:       z.string(),
    description: z.string(),
    pubDate:     z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author:      reference("authors").default({ collection: "authors", id: "kevin-hart" }),
    cover:       image().optional(),
    tags:        z.array(z.string()).default([]),
    draft:       z.boolean().default(false),
  }),
});
```

The `reference("authors")` type links a post's `author` field to the `authors` collection by slug, ensuring referential integrity at build time.

---

## Querying content in pages

```ts
import { getCollection } from "astro:content";

// All published posts, sorted newest first
const posts = (await getCollection("blog", ({ data }) => !data.draft))
  .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

// A single post with its author
const post = await getEntry("blog", slug);
const author = await getEntry(post.data.author);
```

---

## Replacing file-based content with a CMS

The Loader API makes it straightforward to swap the `glob` loader for a CMS loader without changing any page code. See the [Strapi](/integrations/strapi/), [Directus](/integrations/directus/), or [Payload CMS](/integrations/payload/) guides.
