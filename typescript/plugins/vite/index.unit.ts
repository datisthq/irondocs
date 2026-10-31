import { mkdirSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { temporaryDirectory } from "tempy"
import { describe, expect, it } from "vite-plus/test"
import { startVitest } from "vitest/node"
import irondocs from "./index.ts"

describe("irondocs vite plugin", () => {
  it("has the expected plugin name", () => {
    expect(irondocs().name).toBe("irondocs")
  })

  it("serves a doc matched by test.include under its own id", async () => {
    const plugin = configurePlugin("/root", ["docs/**/*.{md,mdx,svx}"])
    for (const file of ["a.md", "b.mdx", "c.svx"]) {
      const id = await invokeResolveId(plugin, `/root/docs/${file}`)
      expect(id).toBe(`\0irondocs:/root/docs/${file}.js`)
    }
  })

  it("leaves a doc outside test.include, or excluded, to other plugins", async () => {
    const plugin = configurePlugin("/root", ["docs/**/*.md"], ["docs/skip/**"])
    expect(await invokeResolveId(plugin, "/root/README.md")).toBeUndefined()
    expect(await invokeResolveId(plugin, "/root/docs/skip/a.md")).toBeUndefined()
    expect(await invokeResolveId(plugin, "/root/docs/a.ts")).toBeUndefined()
  })

  it("loads a doc as a test module and watches its file", () => {
    const dir = temporaryDirectory()
    const path = join(dir, "sum.md")
    writeFileSync(
      path,
      "# Sum\n\n```ts test\nconst n: number = 1\nexpect(n).toBe(1)\n```\n",
    )
    const watched: string[] = []
    const code = expectLoadedCode(
      invokeHook(
        configurePlugin(dir, ["*.md"]).load,
        { addWatchFile: (file: string) => watched.push(file) },
        [`\0irondocs:${path}.js`],
      ),
    )
    expect(code).toContain(`describe("sum.md"`)
    expect(code).toContain(`it("Sum"`)
    expect(code).toContain("const n = 1")
    expect(watched).toEqual([path])
  })

  it("parses an .mdx doc as MDX", () => {
    const dir = temporaryDirectory()
    const path = join(dir, "tabs.mdx")
    writeFileSync(
      path,
      "# Tabs\n\n<Tab>\n  ```ts test\n  expect(1).toBe(1)\n  ```\n</Tab>\n",
    )
    const code = expectLoadedCode(
      invokeHook(configurePlugin(dir, ["*.mdx"]).load, { addWatchFile: () => {} }, [
        `\0irondocs:${path}.js`,
      ]),
    )
    expect(code).toContain(`it("Tabs"`)
  })

  it("refuses a virtual id outside test.include or the doc extensions", () => {
    const dir = temporaryDirectory()
    writeFileSync(join(dir, "secret.txt"), "```ts test\nsecret\n```\n")
    writeFileSync(join(dir, "other.md"), "```ts test\nsecret\n```\n")
    const plugin = configurePlugin(dir, ["docs/*.md", "*.txt"])
    for (const file of ["secret.txt", "other.md"]) {
      const id = `\0irondocs:${join(dir, file)}.js`
      expect(invokeHook(plugin.load, { addWatchFile: () => {} }, [id])).toBeUndefined()
    }
  })

  it("invalidates a doc's test module when its file changes", () => {
    const listeners: ((file: string) => void)[] = []
    const invalidated: unknown[] = []
    const cached = { id: "\0irondocs:/root/a.md.js" }
    const moduleGraph = {
      getModuleById: (id: string) => (id === cached.id ? cached : undefined),
      invalidateModule: (node: unknown) => invalidated.push(node),
    }
    const server = {
      watcher: {
        on: (_event: string, listener: (file: string) => void) =>
          listeners.push(listener),
      },
      environments: { ssr: { moduleGraph } },
    }
    invokeHook(irondocs().configureServer, {}, [server])
    for (const listener of listeners) listener("/root/b.md")
    expect(invalidated).toEqual([])
    for (const listener of listeners) listener("/root/a.md")
    expect(invalidated).toEqual([cached])
  })

  it("ignores ids it did not resolve", () => {
    expect(invokeHook(irondocs().load, {}, ["/root/docs/a.md"])).toBeUndefined()
  })

  it("runs .mdx docs as tests beside a plugin that compiles .mdx", async () => {
    const root = temporaryDirectory()
    mkdirSync(join(root, "docs"))
    const doc =
      "# Guide\n\n<Note>\n  ```ts test\n  expect(1 + 1).toBe(2)\n  ```\n</Note>\n"
    writeFileSync(join(root, "docs/guide.test.mdx"), doc)
    writeFileSync(join(root, "docs/page.mdx"), "# Page\n")
    writeFileSync(
      join(root, "docs/page.test.ts"),
      'import { expect, it } from "vitest"\nimport Page from "./page.mdx"\n' +
        'it("page", () => expect(typeof Page).toBe("function"))\n',
    )
    const compileMdx = {
      name: "compile-mdx",
      transform(_code: string, id: string) {
        const compiled = id.split("?")[0]?.endsWith(".mdx")
        return compiled ? "export default function Page() {}" : null
      },
    }
    const vitest = await startVitest(
      "test",
      [],
      { root, config: false, watch: false, include: ["docs/**/*.test.{ts,mdx}"] },
      { plugins: [compileMdx, irondocs()] },
    )
    await vitest.close()
    const files = vitest.state.getFiles()
    expect(files.map(file => [file.name, file.result?.state]).sort()).toEqual([
      ["docs/guide.test.mdx", "pass"],
      ["docs/page.test.ts", "pass"],
    ])
  })
})

function configurePlugin(root: string, include: string[], exclude: string[] = []) {
  const plugin = irondocs()
  invokeHook(plugin.configResolved, {}, [{ root, test: { include, exclude } }])
  return plugin
}

function invokeResolveId(plugin: ReturnType<typeof irondocs>, source: string) {
  const context = { resolve: async (id: string) => ({ id }) }
  return invokeHook(plugin.resolveId, context, [source, undefined, {}])
}

function invokeHook(hook: unknown, context: object, args: unknown[]): unknown {
  if (typeof hook === "function") return Reflect.apply(hook, context, args)
  if (hook && typeof hook === "object" && "handler" in hook) {
    return invokeHook(hook.handler, context, args)
  }
  throw new Error("hook is not callable")
}

function expectLoadedCode(result: unknown) {
  if (!result || typeof result !== "object" || !("code" in result)) {
    throw new Error("expected load result with .code")
  }
  if (typeof result.code !== "string") throw new Error("expected .code: string")
  return result.code
}
