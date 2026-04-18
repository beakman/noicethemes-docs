---
title: Blog y Contenido
description: Cómo crear y gestionar entradas de blog y perfiles de autores usando la Loader API de Content Collections de Astro.
---

El blog usa la **Loader API** de Astro (introducida en Astro 4.14, estable en v5+). Las entradas de blog y los perfiles de autores son archivos Markdown leídos desde `src/data/` en tiempo de compilación. No hay base de datos — solo archivos.

---

## Ubicación de los archivos

```
src/data/
├── blog/
│   ├── my-first-post.md
│   └── another-article.mdx
└── authors/
    └── jane-doe.md
```

---

## Escribir una entrada de blog

Crea un nuevo archivo `.md` o `.mdx` en `src/data/blog/`. El nombre del archivo se convierte en el slug de la entrada.

```markdown
---
title: "Una guía completa sobre identidad de marca"
description: "Todo lo que necesitas saber para construir una marca sólida y coherente."
pubDate: 2025-04-01
author: jane-doe          # debe coincidir con un nombre de archivo en src/data/authors/
cover: ../../assets/blog/brand-identity.jpg
tags: ["branding", "design", "strategy"]
draft: false
---

El contenido de tu entrada aquí en Markdown...
```

### Campos del frontmatter

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `title` | `string` | ✓ | Título de la entrada — se muestra en listados y en `<title>` |
| `description` | `string` | ✓ | Resumen breve — se usa como meta descripción |
| `pubDate` | `Date` | ✓ | Fecha de publicación (`YYYY-MM-DD`) |
| `updatedDate` | `Date` | | Fecha de la última actualización — se muestra si está definida |
| `author` | `string` | | Slug del autor — debe coincidir con `src/data/authors/{slug}.md` |
| `cover` | `image()` | | Imagen de portada — usa una ruta relativa desde el archivo de la entrada |
| `tags` | `string[]` | | Array de etiquetas — impulsa las páginas de categorías |
| `draft` | `boolean` | | Por defecto `false` — los borradores se excluyen de las compilaciones de producción |

### Imágenes

Coloca las imágenes de portada en `src/assets/blog/` y referéncialas con una ruta relativa:

```yaml
cover: ../../assets/blog/my-image.jpg
```

Astro las optimizará automáticamente (conversión a WebP, `srcset` responsivo).

---

## Escribir un perfil de autor

Crea un archivo `.md` en `src/data/authors/`. El nombre del archivo es el slug del autor que se usa en el frontmatter de las entradas.

```markdown
---
name: "Jane Doe"
role: "Creative Director"
bio: "Jane ha liderado proyectos de marca para empresas Fortune 500 durante más de una década."
avatar: ../../assets/authors/jane-doe.jpg
website: "https://janedoe.com"
twitter: "janedoe"
draft: false
---
```

### Campos del frontmatter del autor

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `name` | `string` | ✓ | Nombre completo para mostrar |
| `role` | `string` | ✓ | Cargo o especialidad |
| `bio` | `string` | ✓ | Biografía breve (1–2 oraciones) |
| `avatar` | `image()` | | Foto de perfil — ruta relativa desde el archivo |
| `website` | `string` | | URL completa incluyendo `https://` |
| `twitter` | `string` | | Identificador sin `@` |
| `draft` | `boolean` | | Oculta al autor de los listados si es `true` |

---

## Páginas del blog

| Ruta | Archivo | Descripción |
|------|---------|-------------|
| `/blog` | `src/pages/blog/index.astro` | Listado paginado de todas las entradas publicadas |
| `/blog/[slug]` | `src/pages/blog/[...slug].astro` | Página de entrada individual |
| `/blog/authors` | `src/pages/blog/authors/index.astro` | Listado de todos los autores |
| `/blog/authors/[slug]` | `src/pages/blog/authors/[slug].astro` | Perfil del autor + sus entradas |
| `/blog/categories/[tag]` | `src/pages/blog/categories/[tag].astro` | Entradas filtradas por etiqueta |

---

## Esquema de contenido (`src/content.config.ts`)

El esquema valida el frontmatter en tiempo de compilación usando Zod. Si una entrada tiene un campo inválido, la compilación falla con un error claro.

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

El tipo `reference("authors")` vincula el campo `author` de una entrada a la colección `authors` mediante el slug, garantizando la integridad referencial en tiempo de compilación.

---

## Consultar contenido en páginas

```ts
import { getCollection } from "astro:content";

// Todas las entradas publicadas, ordenadas de más reciente a más antigua
const posts = (await getCollection("blog", ({ data }) => !data.draft))
  .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

// Una entrada individual con su autor
const post = await getEntry("blog", slug);
const author = await getEntry(post.data.author);
```

---

## Reemplazar el contenido basado en archivos con un CMS

La Loader API facilita el reemplazo del loader `glob` por un loader de CMS sin cambiar ningún código de página. Consulta las guías de [Strapi](/es/integrations/strapi/), [Directus](/es/integrations/directus/) o [Payload CMS](/es/integrations/payload/).
