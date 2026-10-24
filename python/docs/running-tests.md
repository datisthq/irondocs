---
title: Running tests
path: /python/running-tests/
icon: play
order: 3
description: How irondocs blocks show up in your pytest output, and how to filter or debug them.
---

# Running tests

Once irondocs is installed and your `.md` files match `irondocs_files`,
runnable doctests show up alongside your normal test modules in `pytest`
output.

## What you'll see

Each `.md` file appears as one test file. Inside it, every `test`-marked
block becomes one test named after the nearest heading. A docs file with two
marked blocks under headings `Adds` and `Negs` reports as:

```
docs/sum.md::Adds PASSED
docs/sum.md::Negs PASSED
```

Files with no marked blocks collect zero tests — no errors, no noise. Safe to
leave the glob broad.

## Filtering

Standard pytest selection applies to doctests too. They're regular test items
as far as pytest is concerned.

- `pytest -k Adds` runs only matching test names
- `pytest docs/sum.md` runs only that file, even when it matches no `irondocs_files` pattern
- `pytest "docs/sum.md::Adds"` runs one block

## Focusing or skipping individual blocks

To narrow further than pytest's selection, edit the fence itself with
[`only` or `skip`](/python/options/). Useful while iterating on a single
doctest.

## Debugging a failing doctest

Irondocs compiles each block against the lines of its `.md` file, so a failure
points at the very line that failed and shows the surrounding markdown:

````
    ```python test
    from math import fsum

    values = [1, 2]
>   assert fsum(values) == 4
E   assert 3.0 == 4
E    +  where 3.0 = <built-in function fsum>([1, 2])

docs/sum.md:9: AssertionError
````

A block that doesn't parse fails collection with a `SyntaxError` at its `.md`
line.
