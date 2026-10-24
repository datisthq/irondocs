# Contributing

Irondocs is an open-source project and we'd love your help — whether that's fixing a bug, polishing the docs, or proposing a new feature. This guide walks through everything you need to get a change from your editor into a release.

## Quick start

You'll need [Node.js](https://nodejs.org/) 24+, [pnpm](https://pnpm.io/) 11+ and, for the Python package, [uv](https://docs.astral.sh/uv/). Then:

```bash
git clone https://github.com/datisthq/irondocs.git
cd irondocs
pnpm install
pnpm start
```

`pnpm install` also syncs the Python environment when `uv` is on your `PATH`. `pnpm start` boots the docs dev server so you can iterate on the site. To exercise every package:

```bash
pnpm test
```

## Repository layout

```
irondocs/
├── typescript/          # the npm package `irondocs` (irondocs/vite, irondocs/jest)
│   ├── actions/         #   noun/verb action modules
│   │   ├── code/        #     partitionCode — split a block's imports from its body
│   │   ├── markdown/    #     parseMarkdown — find the test-tagged fences in a .md file
│   │   ├── project/     #     createProject — the in-memory ts-morph project
│   │   └── test/        #     renderTestModule — emit the test module the runner loads
│   ├── models/          #   typed records: Block, Partition, Plugin
│   ├── plugins/         #   the vite plugin and the jest transformer
│   ├── docs/            #   the TypeScript pages of the docs site (Markdown)
│   └── vite.config.ts   #   the package's test config
├── python/              # the PyPI package `irondocs`, a uv project
│   ├── irondocs/        #   the twin of typescript/: actions/, models/, plugins/pytest.py
│   └── docs/            #   the Python pages of the docs site; doubles as doctests
├── .agents/skills/      # repo skills for coding agents (see AGENTS.md)
├── .livemark/           # docs-site escapes (theme, landing)
├── .scripts/            # repo-wide guards and the `pnpm squash` script
├── livemark.config.ts   # config for the docs site
├── tsconfig.json
└── vite.config.ts       # vite-plus shared config (format, lint, the guards' tests)
```

The npm package ships `typescript/build/` (compiled by `tsgo`); the PyPI package ships `python/irondocs/` and registers itself with pytest through the `pytest11` entry point. Everything else is for development. A change to shared behaviour lands in both packages.

## Local commands

Run these at the repo root; each chains into the language sections with `pnpm -C <section>`.

| Command            | What it does                                                        |
| ------------------ | ------------------------------------------------------------------- |
| `pnpm install`     | Install dependencies                                                |
| `pnpm build`       | Build `typescript/build/` and the Python wheel                      |
| `pnpm check:types` | Type-check via `tsgo --noEmit` and `ty check`                       |
| `pnpm check:lint`  | Format check + lint (`vp fmt`, `vp lint`, `ruff`)                   |
| `pnpm check`       | `pnpm check:lint && pnpm check:types`                               |
| `pnpm format`      | Auto-fix formatting (`vp fmt`, `ruff format`)                       |
| `pnpm test:unit`   | Run the repo guards, every package's unit tests and the Python docs |
| `pnpm test`        | `pnpm check && pnpm test:unit`                                      |
| `pnpm start`       | Run the docs dev server                                             |
| `pnpm build:docs`  | Production build of the docs site                                   |
| `pnpm scan`        | Secret and vulnerability scans (gitleaks, semgrep)                  |

A change is ready to push when `pnpm test` is green.

## Code conventions

- **TypeScript**: strict mode is on. Don't use `any`, `as`-casts, or non-null `!` without permission — flag it in the PR.
- **Imports**: use full ESM paths with the `.ts(x)` extension (`from "./foo.ts"`). `tsgo` rewrites them to `.js` on emit via `rewriteRelativeImportExtensions`.
- **Comments**: docstrings on exports only. Skip narrative `//` comments inside function bodies.
- **File layout**: high-level public items at the top, private helpers at the bottom.
- **Tests**: unit tests live next to the code as `<module>.unit.ts`; run one from `typescript/` with `vp test <file>`. No "Arrange/Act/Assert" comments — the structure should be obvious.
- **Formatting**: vite-plus via `pnpm format`. 2-space indent, no semicolons, double quotes (LF, UTF-8).
- **Python**: 3.12+, typed for `ty` without `Any`; tests beside the module as `<module>_unit.py`, run one with `uv run pytest <file>` from `python/`.

## Proposing a change

1. **Open an issue first** for anything bigger than a typo or a small bug. It's easier to align on direction before code.
2. **Branch from `main`** with a short descriptive name (e.g. `fix-fence-scanner`, `feat-source-maps`).
3. **Write a focused commit history**. Irondocs uses [Conventional Commits](https://www.conventionalcommits.org/) — the prefix drives release-please:
   - `fix:` — bug fix → patch release
   - `feat:` — new feature → minor release
   - `chore:`, `docs:`, `refactor:`, `test:`, `perf:` — no release
   - Only changes to the published package use `feat` or `fix`; never mark a commit breaking (`!` or a `BREAKING CHANGE:` footer)
4. **Run `pnpm test`** before pushing. The Python docs run as doctests; if you change a plugin's behaviour, the docs must agree.
5. **Open a PR** against `main`. Describe the _why_ (link the issue), include test-runner output for any UX-visible change, and call out anything reviewers should pay extra attention to.

## Releases

Releases are driven by [release-please](https://github.com/googleapis/release-please): a `feat` or `fix` landing on `main` opens a Release PR, and merging it cuts the version, tags it and publishes to npm and PyPI. Each package has its own version. Maintainers don't bump versions manually.

## Where to find help

- **Bugs and feature requests**: [GitHub Issues](https://github.com/datisthq/irondocs/issues)
- **Discussion / ideas**: [GitHub Discussions](https://github.com/datisthq/irondocs/discussions)
- **Source**: [github.com/datisthq/irondocs](https://github.com/datisthq/irondocs)

Thanks for helping make Irondocs better.
