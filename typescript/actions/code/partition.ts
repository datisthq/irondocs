import type { Project } from "ts-morph"
import type { Partition } from "../../models/partition.ts"
import { createProject } from "../project/create.ts"

/**
 * Split a TypeScript snippet into its top-level import declarations
 * (hoistable to the surrounding module) and the rest of its statements.
 */
export function partitionCode(code: string, project?: Project): Partition {
  project ??= createProject()
  const sourceFile = project.createSourceFile("__block.ts", code, {
    overwrite: true,
  })
  const importNodes = sourceFile.getImportDeclarations()
  const imports = importNodes.map(node => node.getText())
  for (const node of importNodes) node.remove()
  return { imports, body: sourceFile.getFullText().trim() }
}
