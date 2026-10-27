---
title: Running tests
path: /typescript/running-tests/
icon: play
order: 3
description: How irondocs blocks show up in your test output, and how to filter or debug them.
---

# Running tests

Once the plugin (or jest transformer) is wired up and your `.md` files are in
`test.include` / `testMatch`, runnable doctests show up alongside your normal
test files in `pnpm test` output.

## What you'll see

Each `.md` file appears as one test file, its tests grouped under a
`describe` named after the file. Every `test`-marked block becomes one `it()`
named after the nearest heading. A docs file with two marked blocks under
headings `Adds` and `Negs` reports as:

```
✓ docs/sum.md (2)
  ✓ sum.md (2)
    ✓ Adds
    ✓ Negs
```

A matched file with no marked blocks is an empty module, and both vitest and
jest fail a test file without tests. Keep `test.include` / `testMatch` to the
files that hold `test` blocks.

## Filtering

Standard vitest/jest filtering applies to doctests too. They're regular
test cases as far as the runner is concerned.

- vitest: `pnpm vitest -t "Adds"` runs only matching test names; `pnpm vitest docs/sum.md` runs only that file.
- jest: `pnpm jest -t "Adds"`; `pnpm jest docs/sum.md`.

## Focusing or skipping individual blocks

To narrow further than the runner's filtering, edit the fence itself with
[`only` or `skip`](/typescript/options/). Useful while iterating on a single doctest.

## Debugging a failing doctest

When a doctest fails, the runner names your `.md` file but reports the line
within the _generated_ test module, so the line number and the code frame it
prints point at unrelated markdown. Source-map generation back to the
original `.md` lines is on the roadmap; until then, the typical workflow is:

1. Look at the test name in the failure (it's the heading or `name="..."`).
2. Open the `.md`, find that heading.
3. The block under it is the failing one.

Most doctest blocks are short enough that step 3 is unambiguous.

## Watch mode

Both vitest and jest's watch modes pick up `.md` edits automatically — vite's
file watcher tracks markdown alongside `.ts`. Save a `.md` change and the
relevant doctests re-run on the next tick.
