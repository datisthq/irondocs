import { toString } from "mdast-util-to-string"
import remarkParse from "remark-parse"
import { unified } from "unified"
import type { Block } from "../../models/block.ts"
import { parseFence } from "../fence/parse.ts"

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

      const fence = parseFence(node.meta ?? "")
      if (!fence.options.includes("test")) continue

      const block: Block = { heading: currentHeading, code: node.value }
      const name = fence.attributes.name
      if (name !== undefined) block.name = name
      if (fence.options.includes("skip")) block.skip = true
      if (fence.options.includes("only")) block.only = true
      blocks.push(block)
    }
  }
  return blocks
}
