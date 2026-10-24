---
name: irondocs-tests
description: Use when writing, wiring or debugging markdown code blocks that run as tests with Irondocs — the `test` fence and its options, the vitest/jest/pytest setup, test names, imports, and reading a failing doctest.
---

# Testing docs with Irondocs

Irondocs turns fenced code blocks in `.md` files into tests for vitest, vite-plus, jest or
pytest. A block tagged `test` runs; an untagged one only renders. Both packages share one fence
contract, so the same markdown habits work in TypeScript and Python.

## Setup

| runner            | install                        | wire it                                                                   |
| ----------------- | ------------------------------ | ------------------------------------------------------------------------- |
| vitest, vite-plus | `npm install -D irondocs`      | `plugins: [irondocs()]` from `irondocs/vite`; add `.md` to `test.include` |
| jest              | `npm install -D irondocs`      | `transform: { "\\.md$": "irondocs/jest" }`; add `.md` to `testMatch`      |
| pytest            | `pip install irondocs` (3.12+) | `irondocs_files = ["docs/*.md"]` under `[tool.pytest.ini_options]`        |

```ts title="vite.config.ts"
import irondocs from "irondocs/vite"
import { defineConfig } from "vitest/config"

export default defineConfig({
  plugins: [irondocs()],
  test: { include: ["**/*.test.ts", "docs/**/*.md"] },
})
```

```toml title="pyproject.toml"
[tool.pytest.ini_options]
testpaths = ["tests", "docs"]
irondocs_files = ["docs/*.md"]
```

pytest loads the plugin on install, but collects nothing until `irondocs_files` matches, and only
from folders it walks: the docs folder must be in `testpaths` or on the command line.

## A test block

````md
## Adds numbers

```ts test
import { sum } from "./sum.ts"
expect(sum(1, 2)).toBe(3)
```

```python test
from mypkg import add
assert add(1, 2) == 3
```
````

- The language comes first: `ts` or `tsx`; `python` or `py`. Then `test`, then options in any
  order. `js`, `jsx`, `pycon` and untagged blocks never run
- **Only top-level fences count.** A block inside a list item or a blockquote renders but is
  silently not collected
- TypeScript gets `describe`, `it` and `expect` injected; Python gets `pytest` (for
  `pytest.raises`) and pytest's assertion rewriting, so use plain `assert`
- Top-level `await` works in both: the TypeScript body runs in an `async` test, a Python block
  with `await` gets its own event loop

## Names and options

A test is named after the nearest preceding heading. Two blocks under one heading become
`Heading #1`, `Heading #2`; a block before any heading takes the file's basename.

| option       | effect                                                            |
| ------------ | ----------------------------------------------------------------- |
| `name="..."` | names the test verbatim, never suffixed — stable across retitling |
| `skip`       | reported as skipped, not run                                      |
| `only`       | runs only the `only` blocks of that file                          |

`skip` beats `only` on the same block. Don't leave `only` in a committed doc: it silently skips
every other block in the file.

## Imports and scope

Imports in any `test` block are hoisted and shared by every block in the same file, so import once
near the top. **Nothing else is shared**: each block is its own scope, and a variable defined in
one block is undefined in the next. Repeat the setup, or fold the steps into one block.

Imports resolve as in a test module beside the `.md` file (TypeScript), or as any pytest module
does (Python: install the package, or set `pythonpath = ["src"]`).

## Running and debugging

| task      | vitest               | jest                | pytest                       |
| --------- | -------------------- | ------------------- | ---------------------------- |
| one file  | `vitest docs/sum.md` | `jest docs/sum.md`  | `pytest docs/sum.md`         |
| by name   | `vitest -t "Adds"`   | `jest -t "Adds"`    | `pytest -k Adds`             |
| one block | `only` on the fence  | `only` on the fence | `pytest "docs/sum.md::Adds"` |

- A `.md` with no `test` blocks yields zero tests, so a broad glob is safe
- **pytest** points a failure at the `.md` line and shows the markdown around it; a block that
  doesn't parse fails collection with a `SyntaxError` at its line
- **vitest and jest** report lines of the generated module (`__out.ts`), not the `.md`. Find the
  block by the test name: the heading or `name="..."`
- jest with `injectGlobals: false`: add `import { describe, it, expect } from "@jest/globals"` to
  one block, and it is hoisted for all. Irondocs is ESM, so CJS jest needs its ESM mode

## References

- Docs: https://irondocs.dev
- TypeScript: https://irondocs.dev/typescript/introduction/ · Python:
  https://irondocs.dev/python/introduction/
