import { readFileSync } from "node:fs"
import { isAbsolute, matchesGlob, relative, resolve } from "node:path"
import type { Plugin as VitePlugin } from "vite"
import { partitionCode } from "../../actions/code/partition.ts"
import { parseMarkdown } from "../../actions/markdown/parse.ts"
import { createProject } from "../../actions/project/create.ts"
import { renderTestModule } from "../../actions/test/render.ts"
import { transpileTestModule } from "../../actions/test/transpile.ts"
import type { Plugin } from "../../models/plugin.ts"

const plugin: Plugin = {
  initialImport: `const { describe, expect, it } = await import("vite-plus/test").catch(() => import("vitest"))`,
}

const EXTENSIONS = [".md", ".mdx", ".svx"]

// A doc is served under its own id: transforming the file's id instead lets
// @mdx-js/rollup or the Svelte plugin compile it as well, and `\0` plus the `.js`
// ending are what their filters skip
const PREFIX = "\0irondocs:"
const SUFFIX = ".js"

/**
 * Vite plugin that turns runnable code blocks in the `.md`, `.mdx` and `.svx` files
 * matched by vitest's `test.include` into vitest tests.
 */
export default function irondocs(): VitePlugin {
  const project = createProject()
  let isTestFile = (_path: string) => false
  return {
    name: "irondocs",
    enforce: "pre",
    configResolved(config) {
      isTestFile = createTestFilter(config, config.root)
    },
    // Vite keys the module by its virtual id, not the doc's path, and vitest turns HMR
    // off, so without this a watch rerun keeps the doc's stale test module
    configureServer(server) {
      server.watcher.on("change", file => {
        for (const environment of Object.values(server.environments)) {
          const cached = environment.moduleGraph.getModuleById(PREFIX + file + SUFFIX)
          if (cached) environment.moduleGraph.invalidateModule(cached)
        }
      })
    },
    async resolveId(source, importer, options) {
      if (!EXTENSIONS.some(extension => source.endsWith(extension))) return
      const resolved = await this.resolve(source, importer, {
        ...options,
        skipSelf: true,
      })
      if (!resolved || !isTestFile(resolved.id)) return
      return PREFIX + resolved.id + SUFFIX
    },
    load(id) {
      if (!id.startsWith(PREFIX) || !id.endsWith(SUFFIX)) return
      const path = id.slice(PREFIX.length, -SUFFIX.length)
      this.addWatchFile(path)
      return {
        code: renderDocument(readFileSync(path, "utf8"), path, project),
        map: null,
      }
    },
  }
}

function renderDocument(
  source: string,
  path: string,
  project: ReturnType<typeof createProject>,
) {
  const blocks = parseMarkdown(source, { mdx: path.endsWith(".mdx") })
  const filename = path.split("/").pop() ?? path
  const enriched = blocks.map(block => ({
    ...block,
    ...partitionCode(block.code, project),
  }))
  return transpileTestModule(renderTestModule(enriched, filename, { plugin, project }), {
    tsx: blocks.some(block => block.tsx),
  })
}

function createTestFilter(config: object, root: string) {
  const test = "test" in config ? config.test : undefined
  const dir = readOption(test, "dir")
  const base = typeof dir === "string" ? resolve(root, dir) : root
  const include = readGlobs(readOption(test, "include"))
  const exclude = readGlobs(readOption(test, "exclude"))
  const matches = (path: string, glob: string) =>
    matchesGlob(isAbsolute(glob) ? path : relative(base, path), glob)
  return (path: string) =>
    !path.includes("/node_modules/") &&
    include.some(glob => matches(path, glob)) &&
    !exclude.some(glob => matches(path, glob))
}

function readOption(test: unknown, key: string) {
  if (typeof test !== "object" || test === null) return undefined
  return Object.entries(test).find(([name]) => name === key)?.[1]
}

function readGlobs(value: unknown) {
  if (!Array.isArray(value)) return []
  return value.filter(glob => typeof glob === "string")
}
