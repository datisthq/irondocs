---
title: Writing tests
path: /python/writing-tests/
icon: file-pen-line
order: 2
description: Mark code blocks as runnable tests and how irondocs picks them up.
---

# Writing tests

Mark a code block in any `.md` file as a runnable test by adding `test` to its
fence info string:

````md
```python test
assert 1 + 1 == 2
```
````

Untagged `python` blocks render normally and are not run, so you can freely
mix illustrative snippets and runnable assertions in the same article.

## Test names

The test name comes from the **nearest preceding heading**. Two blocks under
the same heading are auto-suffixed `#1`, `#2`, and so on. A block with no
preceding heading uses the file's basename; YAML front matter never counts as a
heading. To override naming explicitly, see
[Per-block options](/python/options/).

## Assertions

Use plain `assert`: irondocs runs each block through pytest's assertion
rewriting, so a failing assertion explains itself just as it does in a test
module. `pytest` is injected too, so `pytest.raises` needs no import:

```python test
items = [1, 2, 3]
assert len(items) == 3

with pytest.raises(ZeroDivisionError):
    1 / 0
```

## Imports

Any top-level `import` in a runnable block is hoisted and shared across every
test in the same `.md` file. Everything else a block defines stays local to it:
each block runs in a fresh namespace.

```python test
import json
```

```python test
assert json.loads("[1, 2]") == [1, 2]
```

Imports resolve as in any pytest module. Import your installed package, or put
its folder on the path with pytest's `pythonpath` option.

## Async code

A block may `await` at the top level; irondocs then runs it in its own event
loop.

```python test
import asyncio

assert await asyncio.sleep(0, "done") == "done"
```

## Supported languages

Only `python` and `py` fences are picked up. `pycon` and other blocks render
but are not run.
