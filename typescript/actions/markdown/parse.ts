import { textlane } from "textlane"
import * as md from "textlane/md"
import type { PhrasingContent } from "mdast"
import type { Block } from "../../models/block.ts"
import { parseFence } from "../fence/parse.ts"

// Front matter would otherwise read as a setext heading and name every test after the YAML;
// `...` is YAML's own document end, which remark-frontmatter's preset does not close on
const processor = textlane()
  .use(md.parse())
  .use(md.frontmatter(["yaml", { type: "yaml", fence: { open: "---", close: "..." } }]))

/**
 * Extract runnable code blocks from markdown. A block is runnable when its
 * fence info string starts with `ts` or `tsx` and includes the token `test`.
 * The fence may also carry `skip`, `only`, and `name="..."` options.
 */
export function parseMarkdown(source: string): Block[] {
  const tree = processor.parse(source)
  const blocks: Block[] = []
  let currentHeading = ""

  for (const node of tree.children) {
    if (node.type === "heading") {
      currentHeading = readText(node.children)
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
      if (lang === "tsx") block.tsx = true
      blocks.push(block)
    }
  }
  return blocks
}

function readText(nodes: PhrasingContent[]) {
  let text = ""
  for (const node of nodes) {
    if (node.type === "image") text += node.alt ?? ""
    else if (node.type === "text" || node.type === "inlineCode" || node.type === "html") {
      text += node.value
    } else if (
      node.type === "emphasis" ||
      node.type === "strong" ||
      node.type === "delete" ||
      node.type === "link" ||
      node.type === "linkReference"
    ) {
      text += readText(node.children)
    }
  }
  return text
}
