import { basename } from "node:path"
import { partitionCode } from "../../actions/code/partition.ts"
import { parseMarkdown } from "../../actions/markdown/parse.ts"
import { createProject } from "../../actions/project/create.ts"
import { renderTestModule } from "../../actions/test/render.ts"
import { transpileTestModule } from "../../actions/test/transpile.ts"
import type { Plugin } from "../../models/plugin.ts"

type JestTransformer = {
  process(sourceText: string, sourcePath: string): { code: string }
}

const plugin: Plugin = {
  initialImport: null,
}

const project = createProject()

const EXTENSIONS = [".md", ".mdx", ".svx"]

/**
 * Jest transformer that turns runnable code blocks in `.md`, `.mdx` and `.svx`
 * files into jest tests. Wire into your jest config under `transform`.
 */
const transformer: JestTransformer = {
  process(sourceText, sourcePath) {
    if (!EXTENSIONS.some(extension => sourcePath.endsWith(extension))) {
      return { code: sourceText }
    }
    const blocks = parseMarkdown(sourceText, { mdx: sourcePath.endsWith(".mdx") })
    const filename = basename(sourcePath)
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
    }
  },
}

export default transformer
