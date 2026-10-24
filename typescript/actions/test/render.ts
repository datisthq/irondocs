import type { Project } from "ts-morph"
import type { Block } from "../../models/block.ts"
import type { Partition } from "../../models/partition.ts"
import type { Plugin } from "../../models/plugin.ts"
import { createProject } from "../project/create.ts"

type ItKind = "it" | "it.skip" | "it.only"

/**
 * Assemble the final test module from parsed blocks and their partitioned
 * code, using the plugin's `initialImport` (if any) as the seed for the
 * hoisted import set. Imports are deduped across all blocks.
 */
export function renderTestModule(
  blocks: (Block & Partition)[],
  filename: string,
  options: { plugin: Plugin; project?: Project },
): string {
  if (blocks.length === 0) return "export {}\n"

  const project = options.project ?? createProject()
  const file = project.createSourceFile("__out.ts", "", { overwrite: true })

  const seen = new Set<string>(
    options.plugin.initialImport ? [options.plugin.initialImport] : [],
  )
  for (const block of blocks) {
    for (const imp of block.imports) seen.add(imp)
  }
  for (const imp of seen) file.addStatements(imp)

  const fallback = filename.replace(/\.md$/, "")
  const names = assignNames(blocks, fallback)
  const itStatements = blocks
    .map((block, index) => renderIt(names[index] ?? fallback, block.body, kindFor(block)))
    .join("\n")
  file.addStatements(`describe(${JSON.stringify(filename)}, () => {\n${itStatements}\n})`)

  file.formatText({ indentSize: 2, convertTabsToSpaces: true })
  return file.getFullText()
}

function assignNames(blocks: Block[], fallback: string): string[] {
  const autoTotals = new Map<string, number>()
  for (const block of blocks) {
    if (block.name === undefined) {
      const auto = block.heading || fallback
      autoTotals.set(auto, (autoTotals.get(auto) ?? 0) + 1)
    }
  }

  const seen = new Map<string, number>()
  return blocks.map(block => {
    if (block.name !== undefined) return block.name
    const auto = block.heading || fallback
    if ((autoTotals.get(auto) ?? 0) <= 1) return auto
    const occurrence = (seen.get(auto) ?? 0) + 1
    seen.set(auto, occurrence)
    return `${auto} #${occurrence}`
  })
}

function kindFor(block: Block): ItKind {
  if (block.skip) return "it.skip"
  if (block.only) return "it.only"
  return "it"
}

function renderIt(name: string, body: string, kind: ItKind): string {
  const safeName = JSON.stringify(name)
  if (body.length === 0) {
    return `${kind}(${safeName}, async () => {})`
  }
  return `${kind}(${safeName}, async () => {\n${body}\n})`
}
