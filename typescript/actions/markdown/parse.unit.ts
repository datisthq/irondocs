import { describe, expect, it } from "vite-plus/test"
import { parseMarkdown } from "./parse.ts"

describe("parseMarkdown", () => {
  it("returns empty array for empty source", () => {
    expect(parseMarkdown("")).toEqual([])
  })

  it("returns empty array when no marked blocks", () => {
    const md = "# Title\n\n```ts\nconst x = 1\n```\n"
    expect(parseMarkdown(md)).toEqual([])
  })

  it("extracts a marked ts block under a heading", () => {
    const md = "## Adds two numbers\n\n```ts test\nexpect(1 + 1).toBe(2)\n```\n"
    expect(parseMarkdown(md)).toEqual([
      { heading: "Adds two numbers", code: "expect(1 + 1).toBe(2)" },
    ])
  })

  it("returns each duplicate-heading block separately", () => {
    const md = "## Adds\n\n```ts test\na\n```\n\n## Adds\n\n```ts test\nb\n```\n"
    expect(parseMarkdown(md)).toEqual([
      { heading: "Adds", code: "a" },
      { heading: "Adds", code: "b" },
    ])
  })

  it("ignores `# heading` lines inside a fenced code block", () => {
    const md = "## Real\n\n```ts test\n# not a heading\nexpect(1).toBe(1)\n```\n"
    const blocks = parseMarkdown(md)
    expect(blocks).toHaveLength(1)
    expect(blocks[0]?.heading).toBe("Real")
  })

  it("extracts only marked blocks when interleaved with unmarked", () => {
    const md = [
      "## H",
      "```ts",
      "illustrative",
      "```",
      "```ts test",
      "runnable",
      "```",
    ].join("\n")
    expect(parseMarkdown(md)).toEqual([{ heading: "H", code: "runnable" }])
  })

  it("returns empty heading when no heading precedes the block", () => {
    const md = "```ts test\nexpect(1).toBe(1)\n```\n"
    expect(parseMarkdown(md)).toEqual([{ heading: "", code: "expect(1).toBe(1)" }])
  })

  it("accepts tsx with test token", () => {
    const md = "```tsx test\nconst x = <div />\n```"
    expect(parseMarkdown(md)).toEqual([{ heading: "", code: "const x = <div />" }])
  })

  it("does not accept js with test token", () => {
    const md = "```js test\nconst x = 1\n```"
    expect(parseMarkdown(md)).toEqual([])
  })

  it('captures `name="..."` as the block\'s name override', () => {
    const md = '## H\n\n```ts test name="custom"\nx\n```\n'
    expect(parseMarkdown(md)).toEqual([{ heading: "H", code: "x", name: "custom" }])
  })

  it("captures the `skip` token", () => {
    const md = "## H\n\n```ts test skip\nx\n```\n"
    expect(parseMarkdown(md)).toEqual([{ heading: "H", code: "x", skip: true }])
  })

  it("captures the `only` token", () => {
    const md = "## H\n\n```ts test only\nx\n```\n"
    expect(parseMarkdown(md)).toEqual([{ heading: "H", code: "x", only: true }])
  })

  it("captures combined options", () => {
    const md = '## H\n\n```ts test only name="focus me"\nx\n```\n'
    expect(parseMarkdown(md)).toEqual([
      { heading: "H", code: "x", name: "focus me", only: true },
    ])
  })

  it("does not pick up tokens that appear inside a name value", () => {
    const md = '## H\n\n```ts test name="includes skip word"\nx\n```\n'
    expect(parseMarkdown(md)).toEqual([
      { heading: "H", code: "x", name: "includes skip word" },
    ])
  })

  it("does not match `name=` inside another word", () => {
    const md = '## H\n\n```ts test myname="x"\ny\n```\n'
    expect(parseMarkdown(md)).toEqual([{ heading: "H", code: "y" }])
  })
})
