import type { Project } from "ts-morph"
import { beforeAll, describe, expect, it } from "vite-plus/test"
import { createProject } from "../project/create.ts"
import { partitionCode } from "./partition.ts"

let project: Project

beforeAll(() => {
  project = createProject()
})

describe("partitionCode", () => {
  it("returns empty imports when code has none", () => {
    const result = partitionCode("const x = 1", project)
    expect(result.imports).toEqual([])
    expect(result.body).toBe("const x = 1")
  })

  it("hoists a single-line named import", () => {
    const result = partitionCode(`import { foo } from "x"\nfoo()`, project)
    expect(result.imports).toHaveLength(1)
    expect(result.imports[0]).toContain("foo")
    expect(result.imports[0]).toContain(`"x"`)
    expect(result.body).toBe("foo()")
  })

  it("hoists a multi-line named import", () => {
    const code = `import {\n  a,\n  b,\n} from "x"\na + b`
    const result = partitionCode(code, project)
    expect(result.imports).toHaveLength(1)
    expect(result.imports[0]).toContain("a")
    expect(result.imports[0]).toContain("b")
    expect(result.imports[0]).toContain(`"x"`)
    expect(result.body).toBe("a + b")
  })

  it("hoists a side-effect import", () => {
    const result = partitionCode(`import "x"\nrun()`, project)
    expect(result.imports).toHaveLength(1)
    expect(result.imports[0]).toContain(`"x"`)
    expect(result.body).toBe("run()")
  })

  it("hoists a type-only import", () => {
    const result = partitionCode(
      `import type { X } from "y"\nconst v: X = {} as X`,
      project,
    )
    expect(result.imports).toHaveLength(1)
    expect(result.imports[0]).toContain("type")
    expect(result.imports[0]).toContain("X")
  })

  it("hoists a namespace import", () => {
    const result = partitionCode(`import * as ns from "x"\nns.do()`, project)
    expect(result.imports).toHaveLength(1)
    expect(result.imports[0]).toContain("* as ns")
    expect(result.body).toBe("ns.do()")
  })

  it("hoists a default + named import", () => {
    const result = partitionCode(`import D, { a } from "x"\nD(a)`, project)
    expect(result.imports).toHaveLength(1)
    expect(result.imports[0]).toContain("D")
    expect(result.imports[0]).toContain("a")
    expect(result.body).toBe("D(a)")
  })

  it("hoists multiple imports and preserves body order", () => {
    const code = `import { a } from "x"\nimport { b } from "y"\nconst v = a + b\nrun(v)`
    const result = partitionCode(code, project)
    expect(result.imports).toHaveLength(2)
    expect(result.body).toBe("const v = a + b\nrun(v)")
  })
})
