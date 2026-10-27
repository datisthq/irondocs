---
title: Per-block options
path: /python/options/
icon: settings-2
order: 4
description: Override test names, skip blocks, or focus on one with options in the fence info string.
---

# Per-block options

The fence info string accepts these tokens after `test`:

| Option       | Type   | Effect                                                                          |
| ------------ | ------ | ------------------------------------------------------------------------------- |
| `name="..."` | string | Use the supplied test name instead of the nearest heading. Never auto-suffixed. |
| `skip`       | flag   | Report the test as skipped without running it.                                  |
| `only`       | flag   | Run only the blocks marked `only` in this file; skip the rest.                  |

The options follow livemark's fence-info convention: `key="value"` for
parametric options, bare tokens for booleans. Values may be double- or
single-quoted (`\"` escapes a quote), and words inside any attribute, such as
`title="the only example"`, are never read as options.

## Naming a test explicitly

Useful when the heading is too generic or you want stable names regardless of
heading edits.

````md
```python test name="adds two positive numbers"
assert 1 + 1 == 2
```
````

User-supplied names are passed through verbatim — no `#1`/`#2` suffixing even
on collisions.

## Skipping a test

Marks the block so pytest reports it as skipped (`irondocs: skip`) but doesn't
execute it. Useful for documenting behavior that's pending or temporarily
broken.

````md
```python test skip
raise NotImplementedError
```
````

## Focusing on one test

The pytest counterpart of vitest's `it.only(...)` — only the `only` blocks run
in their file; the others are reported as skipped (`irondocs: only`).

````md
```python test only
assert True
```
````

## Combining options

Options can be combined freely. When both `skip` and `only` are set on the
same block, `skip` wins (safer default for CI: no-op the marker rather than
silently focus).

````md
```python test only name="focus me"
assert True
```
````
