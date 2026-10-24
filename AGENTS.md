# Agents

This file provides guidance to coding agents when working with code in this repository.

Irondocs runs markdown code blocks as tests. Two packages share one contract: TypeScript (a vite plugin and a jest transformer) in `typescript/`, Python (a pytest plugin) in `python/`. The root is a private pnpm workspace holding the shared tooling, release config and the docs site, built with Livemark; it chains each section with `pnpm -C <section>`, never `pnpm -r`.

## General

- **Never commit unless asked to**
- **Never add co-authored by Claude Code to commits!**
- **Never push main or pull requests to origin unless asked to**
- Prioritize using LSP capabilities if possible
- When resolving a TODO, follow its instructions literally
- Run type checking as part of your tasks
- Run specs as part of your tasks
- Run linting as part of your tasks
- Start plan from a summary a new/updated API summary (models/signatures) and most challenging points, continue plan using your default settings
- **After every task, check whether a skill in `.agents/skills/` needs updating, and update it in the same commit.** Read the task description for what it taught: a new convention, a correction to how the work was done, or a decision about how an area should look or behave. Write that into the skill for that area, so the next session follows it without being told again. When no skill covers the area and the lesson will recur, add one.

## Skills

Depth lives in `.agents/skills/` (reached by Claude Code through the `.claude/skills` symlink `pnpm install` creates), so
this file carries invariants and the skills carry procedure. Reach for one before working in
its area. Each is named `<subject>-<facet>`, subject first (`change-review`):

| skill                | when                                                          |
| -------------------- | ------------------------------------------------------------- |
| `change-review`      | reviewing a pull request — also what the review workflow runs |
| `python-development` | working in `python/` — layout, uv commands, typing, twins     |

## Commands

- Run `pnpm install` to install all dependencies (and `uv sync` in `python/` when uv is present)
- Run `pnpm lint` to lint the code (`vp fmt --check && vp lint`, then ruff)
- Run `pnpm format` to auto-fix formatting issues (`vp fmt`, then `ruff format`)
- Run `pnpm type` to check types (`tsgo --noEmit`, then `ty check`)
- Run `pnpm unit` to run the Vitest tests, then pytest
- Run `pnpm -C typescript <script>` or `pnpm -C python <script>` for one section
- Run `pnpm exec vitest run path/to/test.ts` from `typescript/`, or `uv run pytest path/to/module_unit.py` from `python/`, to run a single test

## Formats

- Use 2-space indentation, UTF-8 encoding, and LF line endings
- Use PascalCase for classes and interfaces, and camelCase for methods and variables
- Place high-level public items first in a file and low-level private items last
- Use ES modules with full import paths including the ".ts(x)" file extension

## Types

- Use strict TypeScript with null checks but don't add explicit return types to functions
- Never use TypeScript `any`, type casting `as`, or `!` without permission

## Specs

- Place unit tests in `<module>.unit.ts` (TypeScript) or `<module>_unit.py` (Python) files and don't add useless comments like "Arrange", "Act", "Assert"
- **A behaviour change lands in both packages in the same branch**, with the same names (case-converted), defaults and semantics. A twin left out on purpose is named in the commit body with why

## Releases

Conventional Commits drive [release-please](https://github.com/googleapis/release-please): a
`feat` or `fix` landing on `main` opens a Release PR, and merging that PR cuts the version,
tags it and publishes. Merging is the gate — nothing ships without it.

- **IMPORTANT: only changes to a published package use `feat` or `fix`** — `typescript/actions/`,
  `typescript/models/`, `typescript/plugins/`, the `exports` and `files` in
  `typescript/package.json`; `python/irondocs/` and the `[project]` tables of
  `python/pyproject.toml`. Everything else MUST be `chore` or `docs` — CI and workflows, release
  config, dependencies, tooling, `AGENTS.md`, the README, the docs site
- This is not a style preference. release-please reads the commit type: a `fix:` on a workflow
  file cuts a release and burns a version number on a change no consumer can observe. Version
  numbers can never be reused
- When in doubt, ask whether the change alters what someone installing the package gets.
  If it does not, it is `chore`
- Each section is its own release-please component with its own version and changelog
  (`typescript/CHANGELOG.md` tagged `vX.Y.Z`, `python/CHANGELOG.md` tagged `python-vX.Y.Z`),
  shipped through one combined Release PR. A `feat` spanning both sections releases both, so land
  a change that only moves or shares files as `chore`
- Release config lives in `.release/config.json` and `.release/manifest.json`. The manifest
  holds the current versions and release-please maintains it — never hand-edit it

## Docs

- Add Typedoc comments only for public APIs and don't add them for files or use @params directives
- Add brief docstrings for exporter functions and models (explain what it does)
- Don't write `//` comments in the code
