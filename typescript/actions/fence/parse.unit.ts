import { describe, expect, it } from "vite-plus/test"
import { parseFence } from "./parse.ts"

describe("parseFence", () => {
  it("returns no options for an empty info string", () => {
    expect(parseFence("")).toEqual({ options: [], attributes: {} })
  })

  it("splits bare tokens on any whitespace", () => {
    expect(parseFence("test\tskip  only")).toEqual({
      options: ["test", "skip", "only"],
      attributes: {},
    })
  })

  it("reads double- and single-quoted attributes", () => {
    expect(parseFence(`test name="a b" title='c d'`)).toEqual({
      options: ["test"],
      attributes: { name: "a b", title: "c d" },
    })
  })

  it("never counts words inside an attribute value as options", () => {
    expect(parseFence(`title="the only test to skip"`).options).toEqual([])
  })

  it("unescapes quotes inside a quoted value", () => {
    expect(parseFence(String.raw`test name="has \"esc\""`).attributes).toEqual({
      name: `has "esc"`,
    })
  })

  it("reads an unquoted attribute value up to whitespace", () => {
    expect(parseFence("test name=plain skip")).toEqual({
      options: ["test", "skip"],
      attributes: { name: "plain" },
    })
  })

  it("keys a hyphenated attribute by its full key", () => {
    expect(parseFence(`test data-name="x"`).attributes).toEqual({ "data-name": "x" })
  })

  it("keeps backslashes in an unquoted value", () => {
    expect(parseFence(String.raw`path=C:\dir`).attributes).toEqual({
      path: String.raw`C:\dir`,
    })
  })
})
