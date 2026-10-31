import { textlane } from "textlane"
import * as md from "textlane/md"
import type { Nodes, PhrasingContent } from "mdast"
import type { Block } from "../../models/block.ts"
import { parseFence } from "../fence/parse.ts"

// Front matter would otherwise read as a setext heading and name every test after the YAML;
// `...` is YAML's own document end, which remark-frontmatter's preset does not close on
const frontmatter = md.frontmatter([
  "yaml",
  { type: "yaml", fence: { open: "---", close: "..." } },
])
const markdownProcessor = textlane().use(md.parse()).use(frontmatter)
const mdxProcessor = textlane().use(md.parse()).use(md.mdx()).use(frontmatter)

/**
 * Options for `parseMarkdown`: `mdx` reads the source as MDX, JSX and expressions
 * included, instead of plain markdown.
 */
export type ParseMarkdownOptions = { mdx?: boolean }

/**
 * Extract runnable code blocks from markdown. A block is runnable when its
 * fence info string starts with `ts` or `tsx` and includes the token `test`.
 * The fence may also carry `skip`, `only`, and `name="..."` options.
 */
export function parseMarkdown(source: string, options?: ParseMarkdownOptions) {
  const processor = options?.mdx ? mdxProcessor : markdownProcessor
  const blocks: Block[] = []
  collectBlocks(processor.parse(source).children, { heading: "", blocks })
  return blocks
}

// Containers are walked too: a `test` block inside a list, quote or JSX element is still a
// test, and skipping it would pass the suite without running it
function collectBlocks(nodes: Nodes[], state: { heading: string; blocks: Block[] }) {
  for (const node of nodes) {
    if (node.type === "heading") {
      state.heading = readText(node.children).trim()
    } else if (node.type === "code") {
      const block = readBlock(node.lang ?? "", node.meta ?? "", node.value, state.heading)
      if (block) state.blocks.push(block)
    } else if ("children" in node) {
      collectBlocks(node.children, state)
    }
  }
}

function readBlock(lang: string, meta: string, code: string, heading: string) {
  if (lang !== "ts" && lang !== "tsx") return
  const fence = parseFence(meta)
  if (!fence.options.includes("test")) return

  const block: Block = { heading, code }
  const name = fence.attributes.name
  if (name !== undefined) block.name = name
  if (fence.options.includes("skip")) block.skip = true
  if (fence.options.includes("only")) block.only = true
  if (lang === "tsx") block.tsx = true
  return block
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
