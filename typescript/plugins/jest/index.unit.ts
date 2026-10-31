import { describe, expect, it } from "vite-plus/test"
import transformer from "./index.ts"

describe("irondocs jest transformer", () => {
  it("transforms a marked code block end-to-end", () => {
    const md = "# Sum\n\n```ts test\nexpect(1).toBe(1)\n```\n"
    const { code } = transformer.process(md, "/path/foo.md")
    expect(code).toContain(`describe("foo.md"`)
    expect(code).toContain(`it("Sum"`)
    expect(code).toContain("expect(1).toBe(1)")
    expect(code).not.toContain(`from "vitest"`)
    expect(code).not.toContain(`await import("vite-plus/test")`)
  })

  it("strips TypeScript syntax from a ts block", () => {
    const md = "# T\n\n```ts test\nconst n: number = 1\n```\n"
    const { code } = transformer.process(md, "/path/t.md")
    expect(code).toContain("const n = 1")
    expect(code).not.toContain("number")
  })

  it("returns export {} for md files with no marked blocks", () => {
    const { code } = transformer.process("# H\n\n```ts\nx\n```\n", "/path/empty.md")
    expect(code).toBe("export {};\n")
  })

  it("passes through non-md files unchanged", () => {
    const { code } = transformer.process("console.log()", "/path/foo.ts")
    expect(code).toBe("console.log()")
  })

  it("parses an .mdx file as MDX and an .svx file as markdown", () => {
    const mdx = "# Tabs\n\n<Tab>\n  ```ts test\n  expect(1).toBe(1)\n  ```\n</Tab>\n"
    expect(transformer.process(mdx, "/path/tabs.mdx").code).toContain(`it("Tabs"`)
    const svx =
      "<script>\n  let x = 1\n</script>\n\n# Note\n\n```ts test\nexpect(1).toBe(1)\n```\n"
    expect(transformer.process(svx, "/path/note.svx").code).toContain(`it("Note"`)
  })
})
