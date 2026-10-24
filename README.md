# Irondocs

Run code blocks from your markdown docs as real tests. Mark a fenced block with
`test`, and it becomes a runnable assertion — no separate test file, no
boilerplate, no drift between docs and code.

| Language   | Package                                              | Runs in                 | Docs                                                          |
| ---------- | ---------------------------------------------------- | ----------------------- | ------------------------------------------------------------- |
| TypeScript | [`irondocs`](https://www.npmjs.com/package/irondocs) | vitest, vite-plus, jest | [Introduction](https://irondocs.dev/typescript/introduction/) |
| Python     | [`irondocs`](https://pypi.org/project/irondocs/)     | pytest                  | [Introduction](https://irondocs.dev/python/introduction/)     |

Both packages share one contract: the same fence marker, the same test names
from the nearest heading, the same `name="..."`, `skip` and `only` options and
the same hoisting of imports across a file's blocks. This repository holds both
implementations — `typescript/` and `python/`; see
[Contributing](CONTRIBUTING.md) for the layout and the commands.
