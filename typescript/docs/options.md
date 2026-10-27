---
title: Per-block options
path: /typescript/options/
icon: settings-2
order: 4
description: Override test names, skip blocks, or focus on one with options in the fence info string.
---

# Per-block options

The fence info string accepts these tokens after `test`:

| Option       | Type   | Effect                                                                          |
| ------------ | ------ | ------------------------------------------------------------------------------- |
| `name="..."` | string | Use the supplied test name instead of the nearest heading. Never auto-suffixed. |
| `skip`       | flag   | Emit as `it.skip(...)` — the test is reported but not run.                      |
| `only`       | flag   | Emit as `it.only(...)` — focus only on this test in its file.                   |

The options follow livemark's fence-info convention: `key="value"` for
parametric options, bare tokens for booleans. Values may be double- or
single-quoted (`\"` escapes a quote), and words inside any attribute, such as
`title="the only example"`, are never read as options.

## Naming a test explicitly

Useful when the heading is too generic or you want stable names regardless of
heading edits.

````md
```ts test name="adds two positive numbers"
expect(1 + 1).toBe(2)
```
````

User-supplied names are passed through verbatim — no `#1`/`#2` suffixing even
on collisions.

## Skipping a test

Marks the block so vitest/jest reports it but doesn't execute it. Useful for
documenting behavior that's pending or temporarily broken.

````md
```ts test skip
// not executed
```
````

## Focusing on one test

Mirrors vitest/jest `it.only(...)` — only this block runs in its file; all
others are skipped.

````md
```ts test only
expect(true).toBe(true)
```
````

## Combining options

Options can be combined freely. When both `skip` and `only` are set on the
same block, `skip` wins (safer default for CI: no-op the marker rather than
silently focus).

````md
```ts test only name="focus me"
expect(true).toBe(true)
```
````
