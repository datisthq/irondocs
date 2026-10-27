import type { Fence } from "../../models/fence.ts"

const TOKEN =
  /([A-Za-z_][\w-]*)=(?:"((?:\\.|[^"\\])*)"?|'((?:\\.|[^'\\])*)'?|(\S*))|(\S+)/g

/**
 * Split a fence info string into its bare options and its `key="value"` attributes.
 * Values may be double-quoted, single-quoted or bare; a backslash escapes a quote.
 */
export function parseFence(meta: string): Fence {
  const fence: Fence = { options: [], attributes: {} }
  for (const match of meta.matchAll(TOKEN)) {
    const [, key, double, single, bare, option] = match
    if (key === undefined) {
      if (option !== undefined) fence.options.push(option)
      continue
    }
    const quoted = double ?? single
    fence.attributes[key] = quoted?.replace(/\\(.)/g, "$1") ?? bare ?? ""
  }
  return fence
}
