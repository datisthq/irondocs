---
name: python-development
description: Use when working in `python/` — the PyPI package, a pytest plugin. Covers its layout, the uv commands, typing rules and how it twins the TypeScript package.
---

# Python development

`python/` is the PyPI package `irondocs`, the twin of `typescript/`: the same fence contract,
run by pytest instead of vitest or jest. A uv project with one package; nothing else in the repo
is Python.

## Commands

Run from the repo root; each wraps `uv run` in `python/package.json`:

```sh
pnpm -C python setup          # uv sync: the venv and dev tools
pnpm -C python check:lint     # ruff check + ruff format --check
pnpm -C python check:types    # ty check
pnpm -C python test:unit      # pytest: the units, then python/docs/ as doctests
pnpm -C python build          # wheel + sdist into python/build/
```

A single test: `uv run pytest irondocs/plugins/pytest_unit.py -k name` from `python/`.
The root `pnpm check` and `pnpm test:unit` chain these after the TypeScript ones.

## Layout

`python/irondocs/` mirrors `typescript/` module for module, with snake_case names:

- `actions/<entity>/<verb>.py` exports `verb_noun` (`actions/markdown/parse.py` →
  `parse_markdown`), the twin of `actions/<entity>/<verb>.ts`
- `models/` — `Block`, `Partition`, and `Doctest` / `DoctestModule` (what `render_test_module`
  returns: compiled-ready AST, not source text)
- `plugins/pytest.py` — the plugin, registered through the `pytest11` entry point; the twin of
  `plugins/vite/` and `plugins/jest/`. There is no `Plugin` model: pytest needs no injected import
- Every `__init__.py` stays empty: no barrels
- Tests sit beside their module as `<module>_unit.py`, `class TestXxx` with `def test_...`;
  plugin tests drive a real pytest run through the `pytester` fixture (`-p pytester` in addopts)

## Typing

- Python 3.12+ syntax; no `Any`, no casts and no `# ty: ignore` without permission
- Never name a model `Test*`: pytest collects it from any `*_unit.py` that imports it, and the
  collection warning is an error under `filterwarnings`

## Twins

A behaviour change lands in both packages in one branch (`AGENTS.md`). Translate rather than
copy:

| TypeScript                            | Python                                                   |
| ------------------------------------- | -------------------------------------------------------- |
| fence `ts` / `tsx`                    | fence `python` / `py`                                    |
| remark, top-level `code` nodes        | markdown-it-py, `level == 0` fence tokens                |
| ts-morph import partition             | `ast` partition, numbered by the block's `.md` line      |
| `describe` / `it` / `expect` injected | `pytest` injected; plain `assert`, rewritten by pytest   |
| `it.skip` / `it.only`                 | `skip` marker; `only` skips the file's other blocks      |
| `async () => {}` body                 | top-level `await` compiled in, run with `asyncio.run`    |
| `test.include` / `testMatch` glob     | `irondocs_files` ini option, plus files named on the CLI |

Names, `#N` suffixing, `name="..."` verbatim and skip-beats-only are identical in both.

## Releases

`python/` is its own release-please component: tags `python-vX.Y.Z`, its own changelog,
published by `uv publish` with PyPI trusted publishing (`release.yaml`, environment `release`).
A `feat` or `fix` touching `python/irondocs/` releases only the Python package.
