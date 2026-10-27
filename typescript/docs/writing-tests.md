---
title: Writing tests
path: /typescript/writing-tests/
icon: file-pen-line
order: 2
description: Mark code blocks as runnable tests and how irondocs picks them up.
---

# Writing tests

Mark a code block in any `.md` file as a runnable test by adding `test` to its
fence info string:

````md
```ts test
expect(1 + 1).toBe(2)
```
````

Untagged `ts` blocks render normally and are not run, so you can freely mix
illustrative snippets and runnable assertions in the same article.

## Test names

The test name comes from the **nearest preceding heading**. Two blocks under
the same heading are auto-suffixed `#1`, `#2`, and so on. A block with no
preceding heading uses the file's basename; YAML front matter never counts as a
heading. To override naming explicitly, see
[Per-block options](/typescript/options/).

## Auto-injected helpers

`describe`, `it`, and `expect` are injected at the top of the generated test
module — you don't need to import them. Doctest bodies stay clean:

````md
```ts test
const items = [1, 2, 3]
expect(items.length).toBe(3)
```
````

## Imports

Any `import` statements inside a runnable block are hoisted to the module top
and shared across every test in the same `.md` file. Multi-line imports work
because the parser uses a real TypeScript AST (ts-morph), not a regex.

````md
```ts test
import { sum } from "./sum.ts"

expect(sum(1, 2)).toBe(3)
```
````

## Supported languages

Only `ts` and `tsx` fences are picked up. `js`/`jsx` blocks render but are
not run — keep tests typed. Irondocs erases the types itself, so no TypeScript
transform needs to cover `.md` files. JSX in a `tsx` block compiles to the automatic
React runtime, so `react/jsx-runtime` must resolve from the docs folder.
