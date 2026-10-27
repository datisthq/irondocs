import { describe, expect, it } from "vite-plus/test"
import irondocs from "./index.ts"

describe("irondocs vite plugin", () => {
  const plugin = irondocs()

  it("has the expected plugin name", () => {
    expect(plugin.name).toBe("irondocs")
  })

  it("transforms a marked code block end-to-end", () => {
    const md = "# Sum\n\n```ts test\nexpect(1).toBe(1)\n```\n"
    const code = expectTransformedCode(
      invokeTransform(plugin.transform, md, "/path/foo.md"),
    )
    expect(code).toContain(`describe("foo.md"`)
    expect(code).toContain(`it("Sum"`)
    expect(code).toContain("expect(1).toBe(1)")
  })

  it("strips TypeScript syntax from a ts block", () => {
    const md =
      '# T\n\n```ts test\nimport type { A } from "a"\nconst n: number = 1 as number\n```\n'
    const code = expectTransformedCode(invokeTransform(plugin.transform, md, "/p/t.md"))
    expect(code).toContain("const n = 1")
    expect(code).not.toContain("number")
    expect(code).not.toContain(`from "a"`)
  })

  it("compiles JSX in a tsx block, keeping its text", () => {
    const md = "# T\n\n```tsx test\nconst el = <div>hi</div>\n```\n"
    const code = expectTransformedCode(invokeTransform(plugin.transform, md, "/p/t.md"))
    expect(code).toContain(`from "react/jsx-runtime"`)
    expect(code).toContain(`children: "hi"`)
  })

  it("keeps a ts-only angle-bracket cast in a ts block", () => {
    const md = "# T\n\n```ts test\nconst n = <number>1\n```\n"
    const code = expectTransformedCode(invokeTransform(plugin.transform, md, "/p/t.md"))
    expect(code).toContain("const n = 1")
  })

  it("returns export {} for md files with no marked blocks", () => {
    const code = expectTransformedCode(
      invokeTransform(plugin.transform, "# H\n\n```ts\nx\n```\n", "/path/empty.md"),
    )
    expect(code).toBe("export {};\n")
  })

  it("returns undefined for non-md files", () => {
    const result = invokeTransform(plugin.transform, "x", "/path/foo.ts")
    expect(result).toBeUndefined()
  })
})

function invokeTransform(hook: unknown, code: string, id: string): unknown {
  if (typeof hook === "function") {
    return hook(code, id)
  }
  if (
    hook &&
    typeof hook === "object" &&
    "handler" in hook &&
    typeof hook.handler === "function"
  ) {
    return hook.handler(code, id)
  }
  throw new Error("transform hook is not callable")
}

function expectTransformedCode(result: unknown): string {
  if (
    !result ||
    typeof result !== "object" ||
    !("code" in result) ||
    typeof result.code !== "string"
  ) {
    throw new Error("expected transform result with .code: string")
  }
  return result.code
}
