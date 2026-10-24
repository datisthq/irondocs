# Contributing

Irondocs is an open-source project and we'd love your help — whether that's fixing a bug, polishing the docs, or proposing a new runner integration. This guide walks through everything you need to get a change from your editor into a release.

## Quick start

You'll need [Node.js](https://nodejs.org/) 24+ and [pnpm](https://pnpm.io/) 10+. Then:

```bash
git clone https://github.com/datisthq/irondocs.git
cd irondocs
pnpm install
pnpm docs:start
```

`pnpm docs:start` boots the livemark dev server so you can iterate on the site. The docs themselves are runnable doctests — `pnpm test` will execute every `ts test`-marked block under `docs/**/*.md` alongside the unit suite.

## Repository layout

```
irondocs/
├── actions/             # noun/verb action modules
│   ├── markdown/        #   parse a markdown source into Block[]
│   ├── code/            #   partition imports/body via ts-morph
│   ├── test/            #   render the final test module
│   └── project/         #   shared ts-morph Project bootstrap
├── models/              # type definitions (Block, Partition, Plugin)
├── plugins/
│   ├── vite/            # vite plugin entry (irondocs/vite)
│   └── jest/            # jest transformer entry (irondocs/jest)
├── docs/                # docs-site content; doubles as doctest fixtures
├── livemark.config.ts   # docs-site config
├── wrangler.jsonc       # Cloudflare Workers deploy for the docs site
└── vite.config.ts       # vite-plus shared config + dogfood wiring
```

The package ships only `build/` (compiled by `tsgo`). Public exports are the two subpaths declared in `package.json`: `irondocs/vite` and `irondocs/jest`.

## Local commands

| Command           | What it does                                                |
| ----------------- | ----------------------------------------------------------- |
| `pnpm install`    | Install dependencies                                        |
| `pnpm build`      | Compile `actions/`, `models/`, `plugins/` → `build/`        |
| `pnpm type`       | Type-check via `tsgo --noEmit`                              |
| `pnpm lint`       | Format check + lint via Biome (`vp fmt --check && vp lint`) |
| `pnpm format`     | Auto-fix formatting (`vp fmt`)                              |
| `pnpm unit`       | Run unit tests + doctests (Vitest via `vp test`)            |
| `pnpm test`       | `pnpm lint && pnpm type && pnpm unit`                       |
| `pnpm docs:start` | Run the livemark docs dev server                            |
| `pnpm docs:build` | Production build of the docs site                           |

A change is ready to push when `pnpm test` is green.

## Code conventions

See [`AGENTS.md`](AGENTS.md) for the canonical list. In short:

- **TypeScript**: strict mode is on. Don't use `any`, `as`-casts, or non-null `!` without permission — flag it in the PR.
- **Imports**: use full ESM paths with the `.ts(x)` extension (`from "./foo.ts"`). `tsgo` rewrites them to `.js` on emit via `rewriteRelativeImportExtensions`.
- **Comments**: docstrings on exports only. Skip narrative `//` comments inside function bodies.
- **File layout**: high-level public items at the top, private helpers at the bottom.
- **Tests**: unit tests live next to the code as `<module>.unit.ts`. No "Arrange/Act/Assert" comments — the structure should be obvious.
- **Formatting**: Biome via `pnpm format`. 2-space indent, no semicolons, double quotes (LF, UTF-8).

## Proposing a change

1. **Open an issue first** for anything bigger than a typo or a small bug. It's easier to align on direction before code.
2. **Branch from `main`** with a short descriptive name (e.g. `fix-fence-scanner`, `feat-source-maps`).
3. **Write a focused commit history**. Irondocs uses [Conventional Commits](https://www.conventionalcommits.org/) — the prefix drives semantic-release:
   - `fix:` — bug fix → patch release
   - `feat:` — new feature → minor release
   - `fix!:` / `feat!:` or a `BREAKING CHANGE:` footer → major release
   - `chore:`, `docs:`, `refactor:`, `test:`, `perf:` — no release
4. **Run `pnpm test`** before pushing. The docs themselves run as doctests; if you change the plugin's behavior, the docs must agree.
5. **Open a PR** against `main`. Describe the _why_ (link the issue), include relevant terminal output for any UX-visible change, and call out anything reviewers should pay extra attention to.

## Releases

Releases are driven by [semantic-release](https://semantic-release.gitbook.io/) on every push to `main`. Conventional commit messages decide the next version automatically. Maintainers don't need to bump versions manually.

For a local version bump (e.g. preparing a non-semantic-release branch), use `pnpm setversion <new-version>` — it sets the version without creating a git tag.

## Where to find help

- **Bugs and feature requests**: [GitHub Issues](https://github.com/datisthq/irondocs/issues)
- **Discussion / ideas**: [GitHub Discussions](https://github.com/datisthq/irondocs/discussions)
- **Source**: [github.com/datisthq/irondocs](https://github.com/datisthq/irondocs)

Thanks for helping make Irondocs better.
