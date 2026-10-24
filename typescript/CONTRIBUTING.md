# Contributing

Irondocs is an open-source project and we'd love your help — whether that's fixing a bug, polishing the docs, or proposing a new runner integration. This guide walks through everything you need to get a change from your editor into a release.

## Quick start

You'll need [Node.js](https://nodejs.org/) 24+, [pnpm](https://pnpm.io/) 11+ and, for the Python package, [uv](https://docs.astral.sh/uv/). Then:

```bash
git clone https://github.com/datisthq/irondocs.git
cd irondocs
pnpm install
pnpm docs:start
```

`pnpm install` also runs `uv sync` in `python/` when uv is on the path. `pnpm docs:start` boots the livemark dev server so you can iterate on the site. The Python docs are runnable doctests — `pnpm test` executes every `python test`-marked block under `python/docs/` alongside the unit suites.

## Repository layout

```
irondocs/
├── typescript/          # the npm package (irondocs/vite, irondocs/jest)
│   ├── actions/         #   parse markdown, partition imports, render the test module
│   ├── models/          #   Block, Partition, Plugin
│   ├── plugins/         #   vite plugin and jest transformer entries
│   └── docs/            #   the TypeScript docs section
├── python/              # the PyPI package, a uv project
│   ├── irondocs/        #   the same actions/ and models/, plus plugins/pytest.py
│   └── docs/            #   the Python docs section; doubles as doctests
├── .livemark/           # docs-site landing and components
├── .release/            # release-please config and manifest
├── livemark.config.ts   # docs-site config
└── wrangler.jsonc       # Cloudflare Workers deploy for the docs site
```

The root is a private pnpm workspace holding the shared tooling; each section is one published package. The npm package ships only `typescript/build/` (compiled by `tsgo`); the PyPI package ships `python/irondocs/` without its `*_unit.py` tests and registers itself with pytest through the `pytest11` entry point.

## Local commands

| Command           | What it does                                                               |
| ----------------- | -------------------------------------------------------------------------- |
| `pnpm install`    | Install dependencies, lefthook and the Python venv                         |
| `pnpm build`      | Compile `typescript/build/`, then the wheel and sdist into `python/build/` |
| `pnpm type`       | Type-check via `tsgo --noEmit` and `ty check`                              |
| `pnpm lint`       | Format check + lint (`vp fmt --check && vp lint`, then ruff)               |
| `pnpm format`     | Auto-fix formatting (`vp fmt`, `ruff format`)                              |
| `pnpm unit`       | Run unit tests (Vitest via `vp test`, then pytest)                         |
| `pnpm test`       | `pnpm lint && pnpm type && pnpm unit`                                      |
| `pnpm docs:start` | Run the livemark docs dev server                                           |
| `pnpm docs:build` | Production build of the docs site                                          |

Each section runs its own slice too: `pnpm -C typescript unit`, `pnpm -C python unit`. A change is ready to push when `pnpm test` is green.

## Code conventions

See [`AGENTS.md`](AGENTS.md) for the canonical list. In short:

- **TypeScript**: strict mode is on. Don't use `any`, `as`-casts, or non-null `!` without permission — flag it in the PR.
- **Python**: 3.12+, typed with `ty`, formatted with ruff at 90 columns. No `Any` and no casts without permission.
- **Imports**: in TypeScript use full ESM paths with the `.ts(x)` extension (`from "./foo.ts"`). `tsgo` rewrites them to `.js` on emit via `rewriteRelativeImportExtensions`.
- **Comments**: docstrings on exports only. Skip narrative comments inside function bodies.
- **File layout**: high-level public items at the top, private helpers at the bottom.
- **Tests**: unit tests live next to the code as `<module>.unit.ts` or `<module>_unit.py`. No "Arrange/Act/Assert" comments — the structure should be obvious.
- **Twins**: a behaviour change lands in both packages, with the same names (case-converted) and the same semantics.

## Proposing a change

1. **Open an issue first** for anything bigger than a typo or a small bug. It's easier to align on direction before code.
2. **Branch from `main`** with a short descriptive name (e.g. `fix-fence-scanner`, `feat-source-maps`).
3. **Write a focused commit history**. Irondocs uses [Conventional Commits](https://www.conventionalcommits.org/) — the prefix drives the release:
   - `fix:` — bug fix → patch release
   - `feat:` — new feature → minor release
   - `chore:`, `docs:`, `refactor:`, `test:` — no release
4. **Run `pnpm test`** before pushing. The docs themselves run as doctests; if you change a plugin's behavior, the docs must agree.
5. **Open a PR** against `main`. Describe the _why_ (link the issue), include relevant terminal output for any UX-visible change, and call out anything reviewers should pay extra attention to.

## Releases

Releases are driven by [release-please](https://github.com/googleapis/release-please). A `feat` or `fix` landing on `main` opens a Release PR with the computed version and changelog; merging it tags, publishes and creates the GitHub release. Each section is its own component with its own version and changelog: tags `vX.Y.Z` publish the npm package, tags `python-vX.Y.Z` the PyPI one. Maintainers don't bump versions by hand.

## Where to find help

- **Bugs and feature requests**: [GitHub Issues](https://github.com/datisthq/irondocs/issues)
- **Discussion / ideas**: [GitHub Discussions](https://github.com/datisthq/irondocs/discussions)
- **Source**: [github.com/datisthq/irondocs](https://github.com/datisthq/irondocs)

Thanks for helping make Irondocs better.
