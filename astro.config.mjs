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
          label: "Guides",
          items: [{ label: "Quick Start", link: "/guides/quick-start/" }],
        },
        {
          label: "Reference",
          autogenerate: { directory: "reference" },
        },
      ],
    }),
  ],
});
