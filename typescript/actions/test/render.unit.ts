import { describe, expect, it } from "vite-plus/test"
import type { Plugin } from "../../models/plugin.ts"
import { renderTestModule } from "./render.ts"

const vitestPlugin: Plugin = {
  initialImport: `const { describe, expect, it } = await import("vite-plus/test").catch(() => import("vitest"))`,
}

const jestPlugin: Plugin = {
  initialImport: null,
}

describe("renderTestModule", () => {
  it("returns export {} for empty input", () => {
    expect(renderTestModule([], "foo.md", { plugin: vitestPlugin })).toBe("export {}\n")
  })

  it("wraps a single block in describe + async it", () => {
    const out = renderTestModule(
      [
        {
          heading: "Adds",
          code: "",
          imports: [],
          body: "expect(1).toBe(1)",
        },
      ],
      "foo.md",
      { plugin: vitestPlugin },
    )
    expect(out).toContain(`describe("foo.md", () =>`)
    expect(out).toContain(`it("Adds", async () =>`)
    expect(out).toContain("expect(1).toBe(1)")
    expect(out).toContain(`await import("vite-plus/test").catch(() => import("vitest"))`)
  })

  it("suffixes duplicate headings with #N", () => {
    const out = renderTestModule(
      [
        { heading: "Adds", code: "", imports: [], body: "a" },
        { heading: "Adds", code: "", imports: [], body: "b" },
      ],
      "foo.md",
      { plugin: vitestPlugin },
    )
    expect(out).toContain(`it("Adds #1"`)
    expect(out).toContain(`it("Adds #2"`)
  })

  it("dedupes imports across blocks", () => {
    const out = renderTestModule(
      [
        {
          heading: "A",
          code: "",
          imports: [`import { sum } from "lib"`],
          body: "sum(1, 2)",
        },
        {
          heading: "B",
          code: "",
          imports: [`import { sum } from "lib"`],
          body: "sum(3, 4)",
        },
      ],
      "foo.md",
      { plugin: vitestPlugin },
    )
    const matches = out.match(/import \{ sum \} from "lib"/g) ?? []
    expect(matches).toHaveLength(1)
  })

  it("falls back to filename basename when heading is empty", () => {
    const out = renderTestModule(
      [{ heading: "", code: "", imports: [], body: "ok()" }],
      "configuration.md",
      { plugin: vitestPlugin },
    )
    expect(out).toContain(`it("configuration"`)
  })

  it("emits empty it body cleanly", () => {
    const out = renderTestModule(
      [
        {
          heading: "X",
          code: "",
          imports: [`import "side-effect"`],
          body: "",
        },
      ],
      "foo.md",
      { plugin: vitestPlugin },
    )
    expect(out).toContain(`it("X", async () => { })`)
    expect(out).toContain(`import "side-effect"`)
  })

  it("emits no auto-injected import when plugin.initialImport is null", () => {
    const out = renderTestModule(
      [
        {
          heading: "Sum",
          code: "",
          imports: [],
          body: "expect(1).toBe(1)",
        },
      ],
      "foo.md",
      { plugin: jestPlugin },
    )
    expect(out).toContain(`describe("foo.md"`)
    expect(out).toContain(`it("Sum"`)
    expect(out).toContain("expect(1).toBe(1)")
    expect(out).not.toContain(`from "vitest"`)
    expect(out).not.toContain(`await import("vite-plus/test")`)
  })

  it("still hoists user imports when plugin.initialImport is null", () => {
    const out = renderTestModule(
      [
        {
          heading: "Add",
          code: "",
          imports: [`import { sum } from "lib"`],
          body: "expect(sum(1, 2)).toBe(3)",
        },
      ],
      "foo.md",
      { plugin: jestPlugin },
    )
    expect(out).toContain(`import { sum } from "lib"`)
    expect(out).not.toContain(`from "vitest"`)
  })

  it("uses block.name verbatim instead of heading when set", () => {
    const out = renderTestModule(
      [
        {
          heading: "ignored",
          code: "",
          name: "explicit name",
          imports: [],
          body: "expect(1).toBe(1)",
        },
      ],
      "foo.md",
      { plugin: vitestPlugin },
    )
    expect(out).toContain(`it("explicit name"`)
    expect(out).not.toContain(`it("ignored"`)
  })

  it("does not suffix user-supplied duplicate names", () => {
    const out = renderTestModule(
      [
        {
          heading: "h",
          code: "",
          name: "same",
          imports: [],
          body: "a",
        },
        {
          heading: "h",
          code: "",
          name: "same",
          imports: [],
          body: "b",
        },
      ],
      "foo.md",
      { plugin: vitestPlugin },
    )
    const matches = out.match(/it\("same"/g) ?? []
    expect(matches).toHaveLength(2)
    expect(out).not.toContain("#1")
  })

  it("emits it.skip when block.skip is true", () => {
    const out = renderTestModule(
      [
        {
          heading: "X",
          code: "",
          skip: true,
          imports: [],
          body: "expect(1).toBe(1)",
        },
      ],
      "foo.md",
      { plugin: vitestPlugin },
    )
    expect(out).toContain(`it.skip("X"`)
    expect(out).not.toMatch(/\bit\("X"/)
  })

  it("emits it.only when block.only is true", () => {
    const out = renderTestModule(
      [
        {
          heading: "X",
          code: "",
          only: true,
          imports: [],
          body: "expect(1).toBe(1)",
        },
      ],
      "foo.md",
      { plugin: vitestPlugin },
    )
    expect(out).toContain(`it.only("X"`)
    expect(out).not.toMatch(/\bit\("X"/)
  })

  it("prefers it.skip over it.only when both are set", () => {
    const out = renderTestModule(
      [
        {
          heading: "X",
          code: "",
          skip: true,
          only: true,
          imports: [],
          body: "expect(1).toBe(1)",
        },
      ],
      "foo.md",
      { plugin: vitestPlugin },
    )
    expect(out).toContain(`it.skip("X"`)
    expect(out).not.toContain(`it.only("X"`)
  })
})
