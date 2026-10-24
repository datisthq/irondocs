import { defineConfig } from "livemark"

export default defineConfig({
  site: "https://irondocs.dev",
  title: "Irondocs",
  description: "Test codeblocks in Markdown",
  logo: "/logo.svg",
  favicon: "/logo.png",
  include: [
    "python/README.md",
    "python/docs/**/*.md",
    "python/CONTRIBUTING.md",
    "python/CHANGELOG.md",
    "typescript/README.md",
    "typescript/docs/**/*.md",
    "typescript/CONTRIBUTING.md",
    "typescript/CHANGELOG.md",
  ],
  sections: [
    { title: "Python", prefix: "/python/", icon: "code" },
    { title: "TypeScript", prefix: "/typescript/", icon: "code-xml" },
    {
      title: "GitHub",
      type: "custom",
      url: "https://github.com/datisthq/irondocs",
      icon: "github",
    },
  ],
  patches: [
    {
      file: "python/README.md",
      article: {
        title: "Introduction",
        description: "Install irondocs for pytest and get started.",
        icon: "rocket",
        order: 1,
        path: "/python/introduction/",
      },
    },
    {
      file: "python/CONTRIBUTING.md",
      article: {
        title: "Contributing",
        description:
          "How to set up irondocs locally, propose changes, and ship a release.",
        icon: "heart-handshake",
        order: -2,
        path: "/python/contributing/",
      },
    },
    {
      file: "python/CHANGELOG.md",
      article: {
        title: "Changelog",
        description: "What changed in each release of the Python package.",
        icon: "history",
        order: -1,
        path: "/python/changelog/",
      },
    },
    {
      file: "typescript/README.md",
      article: {
        title: "Introduction",
        description: "Install irondocs for vitest or jest and get started.",
        icon: "rocket",
        order: 1,
        path: "/typescript/introduction/",
      },
    },
    {
      file: "typescript/CONTRIBUTING.md",
      article: {
        title: "Contributing",
        description:
          "How to set up irondocs locally, propose changes, and ship a release.",
        icon: "heart-handshake",
        order: -2,
        path: "/typescript/contributing/",
      },
    },
    {
      file: "typescript/CHANGELOG.md",
      article: {
        title: "Changelog",
        description: "What changed in each release of the TypeScript package.",
        icon: "history",
        order: -1,
        path: "/typescript/changelog/",
      },
    },
  ],
})
