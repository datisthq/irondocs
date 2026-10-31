# irondocs

Irondocs runs markdown code blocks as tests. Two packages share one contract: TypeScript (a vite plugin and a jest transformer) in `typescript/`, Python (a pytest plugin) in `python/`. The repo root holds the tooling shared across languages and Irondocs' own docs site, built with Livemark.

## Terminology

- **package** — what `npm install irondocs` gets (`typescript/build/`, exported as `irondocs/vite` and `irondocs/jest`), or `pip install irondocs` (`python/irondocs/`, registered with pytest through the `pytest11` entry point)
- **twin** — the same behaviour's counterpart in the other package: `parseMarkdown` ↔ `parse_markdown`, `plugins/vite/` and `plugins/jest/` ↔ `plugins/pytest.py`
- **block** — a fenced code block in a `.md` file; one tagged `test` (` ```ts test `, ` ```python test `) becomes a test, an untagged one renders and never runs
- **plugin** — the runner integration that turns a `.md` file into a test module: `typescript/plugins/vite/`, `typescript/plugins/jest/`, `python/irondocs/plugins/pytest.py`
- **docs site** — `python/docs/`, `typescript/docs/`, each section's README and its copy of `CONTRIBUTING.md`, built by `pnpm build:docs` and deployed to irondocs.dev. The Python docs double as doctests: `pnpm -C python test:unit` runs them

## Rules

- **Never commit unless asked to** — except that a session working directly on `main` commits each task once done. The root's index is shared, so always commit with a pathspec: `git commit -m "…" -- <your paths>` — `git add` new files first, since a pathspec commit silently skips untracked ones.
- **Never add co-authored by Claude Code to commits!**
- **Never mark a commit breaking** — no `!` and no `BREAKING CHANGE:` footer; release-please turns either into a major bump.
- **Never push main or pull requests to origin unless asked to.**
- **Never amend or rewrite existing commits unless asked** (`--amend`, `reset`, `rebase`, force-squash). Fold changes in with a follow-up commit.
- **Never change code unless asked to.** Usually just answer.
- When resolving a TODO, follow its instructions literally. Prefer LSP capabilities where available.
- Start a plan from a summary of the new or changed API (models and signatures) and the hardest points.
- **Every plan ends by asking how to work it** (`AskUserQuestion`, before finalising): **the current branch** or **a `.worktrees/<name>` branch** (**`worktree-workflow`**).
- **A behaviour change lands on both twins in the same branch**, with the same names (case-converted), defaults and semantics. A twin left out on purpose is named in the commit body with why. **`python-development`** holds the Python side.
- **The fence contract is public API.** Renaming the `test` tag, a fence attribute (`name="..."`, `skip`, `only`), a plugin option or an export path silently breaks every doc suite built on the package. Treat it like an export change (**`change-review`**).
- **The landing mirrors `../fireargs`' section for section** (`.livemark/routes/index.tsx`): hero carousel, a Python/TypeScript `LangTabs` switch (Python first and default), window cards. Port a change there before inventing one here. Old root doc paths redirect via `.livemark/public/_redirects`.
- Use full relative import paths with the `.ts` / `.tsx` extension. No barrel re-export files — each `plugins/<runner>/index.ts` is a public entry.
- Each `actions/<entity>/<verb>.ts` holds one action, named after its verb (`actions/markdown/parse.ts` exports `parseMarkdown`); a new action gets its own file.
- Don't destructure props in the function signature — use `props.x`. Put higher-level items above the ones they compose, public before private.
- **Comments must not outnumber code**, and one is at most ~3 lines. The bar is: **name the specific mistake this prevents** — if you cannot, delete it. A file with none is normal. Rationale and history belong in git; only a non-obvious invariant (an ordering types cannot express, a failure that looks like success, a deliberate deviation from a rule here) earns lines.
- Typedoc comments only on public API — a brief line on what an exported function or model does; none on files and no `@param`.
- Update docs when a change requires it (**`human-documentation`**), and **after every task record any lesson it taught** in the same commit (**`agent-documentation`**).
- **End every response that finishes a task with a status line: one bold sentence of about ten words, as the final paragraph, nothing after it** (e.g. **Ready to commit; lint, types and units green.**).

## Skills

Depth lives in skills: this file carries invariants, the skills carry procedure. Reach for one before working in its area. **A repo skill beats a plugin skill on the same subject** — `change-verification` over verification-before-completion, `change-review` over a generic code review. Each is named `<subject>-<facet>`, subject first.

Repo skills live in `.agents/skills/` (reached by Claude Code through the `.claude/skills` symlink `pnpm install` creates) and are never published:

| skill                 | when                                                                    |
| --------------------- | ----------------------------------------------------------------------- |
| `agent-documentation` | writing a session's lesson into a skill or `AGENTS.md`                  |
| `change-review`       | reviewing a pull request or the working diff — also what CI review runs |
| `change-verification` | checking a change works — the smallest lint/type/unit slice and a look  |
| `human-documentation` | the docs-truth pass before a commit, and where a fact belongs           |
| `issue-resolution`    | taking one issue or bug report to one tested commit in a worktree       |
| `python-development`  | working in `python/` — layout, uv commands, typing, twins               |
| `worktree-workflow`   | starting, running and landing a `.worktrees/<name>` branch              |

Shipped skills live in `.skills/` and teach coding agents to **use** Irondocs; the docs site links them. Read the matching one before changing the behaviour it describes, and update it in the same commit:

| skill            | when                                                           |
| ---------------- | -------------------------------------------------------------- |
| `irondocs-tests` | writing, wiring or debugging markdown blocks that run as tests |

**There is exactly one `AGENTS.md`, at the root.** `.scripts/-test/docs.unit.ts` enforces that, along with every path and `pnpm` command these documents name and the two tables above.

## Commands

- `pnpm install` — dependencies, lefthook, the `.claude/skills` symlink and, when uv is present, the Python venv
- `pnpm start` — the dev server over this repo's docs site · `pnpm build:docs` — its production build
- `pnpm build` — compile `typescript/build/` with `tsgo` (`typescript/tsconfig.build.json`), then the wheel and sdist into `python/build/` with `uv build`
- `pnpm test` — full gate: lint + type + unit · `pnpm check` — lint + type
- `pnpm check:lint` — `vp fmt --check && vp lint`, then ruff · `pnpm format` — `vp fmt`, `ruff format` · `pnpm check:types` — `tsgo --noEmit`, then `ty check`
- `pnpm test:unit` — the repo guards, then each package's units (and the Python docs as doctests). Single test, from `typescript/`: `vp test path/to/file.unit.ts` or `vp test -t "name"`; from `python/`: `uv run pytest path/to/module_unit.py`. While iterating, verify the slice the diff reaches, not the full gate (**`change-verification`**)
- `pnpm measure:coverage` — the unit tests with coverage, which `vp test` leaves off
- `pnpm scan:leaks` / `pnpm scan:vulns` / `pnpm scan` — gitleaks / semgrep / both
- `pnpm update:deps` — bump dependencies past a 7-day cooldown
- `pnpm -C typescript release` / `pnpm -C python release` — publish to npm / PyPI; run by the release workflow only
- `pnpm squash <branch> -m "<subject>"` — land a worktree branch on local `main` as one commit (**`worktree-workflow`**)

## Code structure

The root is a private pnpm workspace (`package.json`, `pnpm-workspace.yaml`): format, lint, the docs site, the repo guards and the scripts that chain each language section with `pnpm -C <section>` — never `pnpm -r`. Each section is one published package.

- `typescript/` — the npm package. `tsgo` compiles it into `typescript/build/`, which ships alone; `typescript/vite.config.ts` holds only its `test` block
  - `actions/<entity>/<verb>.ts` — the **operations**: `markdown/` parses a `.md` file into blocks, `code/` partitions a block's imports from its body, `test/` renders the test module, `project/` creates the ts-morph project
  - `models/<entity>.ts` — `Block`, `Partition`, `Plugin`; `plugins/vite/` and `plugins/jest/` the two public entries
  - Unit tests sit beside their module as `<module>.unit.ts`; `docs/` the section's pages
- `python/` — the PyPI package, a uv project; `python/irondocs/` mirrors `typescript/` module for module, plus `plugins/pytest.py`, with `docs/` beside it (**`python-development`**)
- `README.md`, `CONTRIBUTING.md` and `livemark.config.ts` — the GitHub overview, the contributor guide (copied into each section for its docs-site page; the docs guard keeps the copies equal) and the docs site's config

Dot-directories hold non-package code: `.agents/` repo skills, `.skills/` shipped skills, `.livemark/` the docs site's escapes, `.release/` release-please config, `.scripts/` repo-wide guards (`.scripts/-test/`) and the `pnpm squash` script, whose tests the root `vite.config.ts` runs.

## Conventions

- pnpm `^11`, Node `^24`, ES Modules; vite-plus format and lint (2-space, LF, UTF-8, no semicolons, 90 columns)
- Strict TypeScript with null checks; no explicit return types. Never use `any`, an `as` cast or `!` without permission
- PascalCase types, interfaces and classes; camelCase values. Function names are **verbNoun** (`parseMarkdown`), never a bare verb or noun; factories are `create*` / `build*` / `make*`
- `package.json` script names are `verb[:object]` (`check:lint`, `build:docs`), never noun-first; a `verb:x` script is a part or a scoped run of `verb`
- Specs: Vitest via `vite-plus/test`, `<module>.unit.ts`, no "Arrange / Act / Assert" comments
- Python: 3.12+, uv, ruff (90 columns), `ty`; snake_case **verb_noun** functions, the same no-`Any` rule (**`python-development`**)
- Commits: Conventional Commits, typed by what an installer gets (below)

## Releases

Conventional Commits drive [release-please](https://github.com/googleapis/release-please): a `feat` or `fix` landing on `main` opens a Release PR, and merging that PR cuts the version, tags it and publishes. Merging is the gate — nothing ships without it.

- **IMPORTANT: only changes to a published package use `feat` or `fix`** — `typescript/actions/`, `typescript/models/`, `typescript/plugins/`, the `exports` and `files` in `typescript/package.json`; `python/irondocs/` and the `[project]` tables of `python/pyproject.toml`. Everything else MUST be `chore` or `docs`: CI and workflows, release config, dependencies, tooling, `AGENTS.md`, `.agents/skills/`, the README, the docs site, the shipped `.skills/` (linked from the site, not in any package)
- This is not a style preference. release-please reads the commit type: a `fix:` on a workflow file cuts a release and burns a version number on a change no consumer can observe. Version numbers can never be reused
- When in doubt, ask whether the change alters what someone installing the package gets. If it does not, it is `chore`
- release-please assigns a commit to every component whose path it touches: a `feat` spanning both sections releases both, so land a change that only moves or shares files as `chore`
- Release config lives in `.release/config.json` and `.release/manifest.json`. Each section is its own release-please component, keyed by its path, with its own version and changelog (a `CHANGELOG.md` in each section; tags `typescript-vX.Y.Z` for TypeScript, `python-vX.Y.Z` for Python), and both ship through one combined Release PR. The manifest holds the current versions and release-please maintains it — never hand-edit it
