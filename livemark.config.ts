import { defineConfig } from "livemark"

export default defineConfig({
  site: "https://irondocs.dev",
  title: "Irondocs",
  description: "Test codeblocks in Vitest/Jest",
  logo: "/logo.svg",
  favicon: "/logo.png",
  include: ["docs/**/*.md", "README.md", "CONTRIBUTING.md"],
  sections: [
    { title: "Docs", prefix: "/" },
    {
      title: "Changelog",
      prefix: "/changelog/",
      type: "changelog",
      source: "CHANGELOG.md",
      version: true,
    },
  ],
  links: [
    {
      url: "https://github.com/datisthq/irondocs",
      title: "GitHub",
      icon: "github",
    },
  ],
  patches: [
    {
      file: "README.md",
      article: {
        title: "Introduction",
        description: "Install irondocs and get started.",
        icon: "rocket",
        order: 1,
        path: "/introduction/",
      },
    },
    {
      file: "CONTRIBUTING.md",
      article: {
        title: "Contributing",
        description:
          "How to set up irondocs locally, propose changes, and ship a release.",
        icon: "heart-handshake",
        order: -1,
        path: "/contributing/",
      },
    },
  ],
})
