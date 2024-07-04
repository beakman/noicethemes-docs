import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      title: "NOICETHEMES",
      logo: {
        src: "./src/assets/noice-logo.svg",
      },
      logo: {
        light: "./src/assets/noice-logo.svg",
        dark: "./src/assets/noice-logo-dark.svg",
      },
      customCss: [
        // Relative path to your custom CSS file
        "./src/styles/custom.css",
      ],
      // Set English as the default language for this site.
      defaultLocale: "root",
      locales: {
        root: {
          label: "English",
          lang: "en", // lang is required for root locales
        },
        // Spanish docs in `src/content/docs/es/`
        es: {
          label: "Español",
          lang: "es",
        },
      },
      social: {
        github: "https://github.com/withastro/starlight",
      },
      sidebar: [
        {
          label: "Guides",
          items: [
            // Each item here is one entry in the navigation menu.
            { label: "Example Guide", link: "/guides/example/" },
          ],
        },
        {
          label: "Reference",
          autogenerate: { directory: "reference" },
        },
      ],
    }),
  ],
});
