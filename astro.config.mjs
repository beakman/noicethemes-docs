import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      title: "NOICETHEMES",
      logo: {
        light: "./src/assets/noice-logo.svg",
        dark: "./src/assets/noice-logo-dark.svg",
      },
      customCss: ["./src/styles/custom.css"],
      defaultLocale: "root",
      locales: {
        root: {
          label: "English",
          lang: "en",
        },
        es: {
          label: "Español",
          lang: "es",
        },
      },
      social: [
        {
          icon: "github",
          href: "https://github.com/noicethemes",
          label: "GitHub",
        },
      ],
      sidebar: [
        {
          label: "Getting Started",
          items: [
            { label: "Quick Start",       link: "/guides/quick-start/"       },
            { label: "Project Structure", link: "/guides/project-structure/" },
            { label: "Configuration",     link: "/guides/configuration/"     },
          ],
        },
        {
          label: "Guides",
          items: [
            { label: "Customization",          link: "/guides/customization/"  },
            { label: "Internationalization",    link: "/guides/i18n/"           },
            { label: "Blog & Content",          link: "/guides/content/"        },
            { label: "Landing Page Variants",   link: "/guides/landing-pages/"  },
            { label: "Contact Form",            link: "/guides/contact-form/"   },
            { label: "SSR Adapters",            link: "/guides/ssr-adapters/"   },
            { label: "Deployment",              link: "/guides/deployment/"     },
          ],
        },
        {
          label: "Integrations",
          items: [
            { label: "Strapi v5",          link: "/integrations/strapi/"    },
            { label: "Directus 11",        link: "/integrations/directus/"  },
            { label: "Payload CMS v3",     link: "/integrations/payload/"   },
            { label: "Plausible Analytics",link: "/integrations/plausible/" },
          ],
        },
      ],
    }),
  ],
});
