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

/**
 * Vite plugin that turns runnable code blocks in `.md` files into vitest tests.
 */
export default function irondocs(): VitePlugin {
  const project = createProject()
  return {
    name: "irondocs",
    transform(code, id) {
      if (!id.endsWith(".md")) return
      const blocks = parseMarkdown(code)
      const filename = id.split("/").pop() ?? id
      const enriched = blocks.map(block => ({
        ...block,
        ...partitionCode(block.code, project),
      }))
      return {
        code: transpileTestModule(
          renderTestModule(enriched, filename, { plugin, project }),
          {
            tsx: blocks.some(block => block.tsx),
          },
        ),
        map: null,
      }
    },
  }
}
