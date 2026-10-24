import { toString } from "mdast-util-to-string"
import remarkParse from "remark-parse"
import { unified } from "unified"
import type { Block } from "../../models/block.ts"

/**
 * Extract runnable code blocks from markdown. A block is runnable when its
 * fence info string starts with `ts` or `tsx` and includes the token `test`.
 * The fence may also carry `skip`, `only`, and `name="..."` options.
 */
export function parseMarkdown(source: string): Block[] {
  const tree = unified().use(remarkParse).parse(source)
  const blocks: Block[] = []
  let currentHeading = ""

  for (const node of tree.children) {
    if (node.type === "heading") {
      currentHeading = toString(node)
    } else if (node.type === "code") {
      const lang = node.lang ?? ""
      if (lang !== "ts" && lang !== "tsx") continue

      const meta = node.meta ?? ""
      const nameMatch = meta.match(/\bname="([^"]*)"/)
      const stripped = meta.replace(/\bname="[^"]*"/g, "")
      const tokens = stripped.split(/\s+/).filter(Boolean)
      if (!tokens.includes("test")) continue

      const block: Block = { heading: currentHeading, code: node.value }
      if (nameMatch?.[1] !== undefined) block.name = nameMatch[1]
      if (tokens.includes("skip")) block.skip = true
      if (tokens.includes("only")) block.only = true
      blocks.push(block)
    }
  }
  return blocks
}
