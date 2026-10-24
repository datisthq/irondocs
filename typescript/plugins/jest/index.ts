import { partitionCode } from "../../actions/code/partition.ts"
import { parseMarkdown } from "../../actions/markdown/parse.ts"
import { createProject } from "../../actions/project/create.ts"
import { renderTestModule } from "../../actions/test/render.ts"
import type { Plugin } from "../../models/plugin.ts"

type JestTransformer = {
  process(sourceText: string, sourcePath: string): { code: string }
}

const plugin: Plugin = {
  initialImport: null,
}

const project = createProject()

/**
 * Jest transformer that turns runnable code blocks in `.md` files into
 * jest tests. Wire into your jest config under `transform`.
 */
const transformer: JestTransformer = {
  process(sourceText, sourcePath) {
    if (!sourcePath.endsWith(".md")) return { code: sourceText }
    const blocks = parseMarkdown(sourceText)
    const filename = sourcePath.split("/").pop() ?? sourcePath
    const enriched = blocks.map(block => ({
      ...block,
      ...partitionCode(block.code, project),
    }))
    return {
      code: renderTestModule(enriched, filename, { plugin, project }),
    }
  },
}

export default transformer
