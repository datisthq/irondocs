import { Node, type Project } from "ts-morph"
import type { Block } from "../../models/block.ts"
import type { Partition } from "../../models/partition.ts"

type Binding = {
  local: string
  source: string
  specifier: string
  statement: string
  dynamic?: string
}

/**
 * Merge every block's imports into the statements shared by the whole file, one per
 * binding, so overlapping imports never declare a name twice. An import only skipped
 * blocks use becomes a guarded dynamic import, so a pending module cannot fail the file.
 */
export function hoistImports(
  blocks: (Block & Partition)[],
  filename: string,
  project: Project,
): string[] {
  const focused = blocks.some(block => block.only && !block.skip)
  const running = blocks.map(b => ({ runs: !b.skip && (!!b.only || !focused), b }))
  running.sort((left, right) => Number(right.runs) - Number(left.runs))

  const sources = new Map<string, string>()
  const shared = new Set<string>()
  const guarded = new Map<string, string[]>()
  for (const { runs, b } of running) {
    for (const text of b.imports) {
      for (const binding of readBindings(text, project)) {
        const bound = sources.get(binding.local) ?? binding.source
        if (bound !== binding.source) {
          throw new Error(
            `${filename} imports "${binding.local}" as both ${bound} and ${binding.source}`,
          )
        }
        if (sources.has(binding.local) && !runs) continue
        sources.set(binding.local, binding.source)
        if (runs) shared.add(binding.statement)
        else if (binding.dynamic !== undefined) {
          const steps = guarded.get(binding.specifier) ?? []
          guarded.set(binding.specifier, [...steps, binding.dynamic])
        }
      }
    }
  }
  return [...shared, ...[...guarded].map(([specifier, steps]) => guard(specifier, steps))]
}

function readBindings(text: string, project: Project): Binding[] {
  const file = project.createSourceFile("__import.ts", text, { overwrite: true })
  const node = file.getStatements()[0]
  if (Node.isImportEqualsDeclaration(node)) {
    const source = node.getModuleReference().getText()
    return [
      { local: node.getName(), source, specifier: source, statement: node.getText() },
    ]
  }
  if (!Node.isImportDeclaration(node)) return []

  const specifier = node.getModuleSpecifierValue()
  const quoted = JSON.stringify(specifier)
  const from = `from ${quoted}${withAttributes(node.getAttributes()?.getText())}`
  const type = node.isTypeOnly() ? "type " : ""
  const bindings: Binding[] = []
  const local = node.getDefaultImport()?.getText()
  if (local !== undefined) {
    bindings.push({
      local,
      source: `${local} ${from}`,
      specifier,
      statement: `import ${type}${local} ${from}`,
      dynamic: type ? undefined : `${local} = module.default`,
    })
  }
  const namespace = node.getNamespaceImport()?.getText()
  if (namespace !== undefined) {
    bindings.push({
      local: namespace,
      source: `* ${from}`,
      specifier,
      statement: `import ${type}* as ${namespace} ${from}`,
      dynamic: type ? undefined : `${namespace} = module`,
    })
  }
  for (const named of node.getNamedImports()) {
    const imported = named.getNameNode().getText()
    const alias = named.getAliasNode()?.getText() ?? imported
    const typeOnly = type || (named.isTypeOnly() ? "type " : "")
    bindings.push({
      local: alias,
      source: `{ ${imported} } ${from}`,
      specifier,
      statement: `import ${typeOnly}{ ${alias === imported ? alias : `${imported} as ${alias}`} } ${from}`,
      dynamic: typeOnly
        ? undefined
        : `${alias} = module[${JSON.stringify(imported.replace(/^["']|["']$/g, ""))}]`,
    })
  }
  if (bindings.length === 0 && !node.isTypeOnly()) {
    bindings.push({
      local: `import ${quoted}`,
      source: quoted,
      specifier,
      statement: `import ${from.slice("from ".length)}`,
      dynamic: "",
    })
  }
  return bindings
}

function withAttributes(attributes: string | undefined) {
  return attributes === undefined ? "" : ` ${attributes}`
}

function guard(specifier: string, steps: string[]) {
  const assignments = steps.filter(Boolean)
  const locals = assignments.map(step => step.split(" = ")[0])
  const declaration = locals.length > 0 ? `let ${locals.join(", ")}\n` : ""
  const body = [
    `const module = await import(${JSON.stringify(specifier)})`,
    ...assignments,
  ]
  return `${declaration}try {\n${body.join("\n")}\n} catch {}`
}
