---
name: change-review
description: Review a pull request, or the local branch before it lands, for correctness, security and repo conventions — inline PR comments, or a ranked list locally. Invoked by the review workflow or a person; never fires on its own.
disable-model-invocation: true
---

# Review a change

Read the diff, judge it, post findings as inline comments. Be useful, not thorough-looking:
a review that flags twenty things teaches nothing, and the twenty-first — the real one — is lost
in it.

## What to look for

**Correctness**

- Logic that is wrong for an input the change makes reachable, not merely unusual.
- Error handling that swallows a failure or reports success on a partial write.
- Concurrency: an async block body left unawaited, two test files sharing a cached ts-morph
  project, a transform that mutates a parse shared across runs.
- Performance where the change makes it structurally worse (a markdown re-parse per block, a
  ts-morph project created per fence), not where it is merely not optimal.

**Security — OWASP-shaped, but reported only when reachable**

- Injection (SQL and otherwise), XSS, SSRF, XXE, unsafe deserialisation: a fence's meta (a
  `name="..."`) spliced into generated code without escaping, or a block from a file outside the
  configured globs compiled and run.
- Broken isolation: a block's code escaping its test (top-level state leaking between blocks or
  files), or an untagged block run as a test.
- Sensitive data exposure: secrets in code or logs, or a block's source echoed somewhere it was
  not before.
- Insecure cryptography, race conditions and TOCTOU, missing logging on a security-relevant
  action.

**This repo's own invariants** — these are where a generic reviewer is blind, and they matter
more than the generic checklist:

- a change to the `exports` map (`irondocs/vite`, `irondocs/jest`), the `pytest11` entry point or a
  plugin option that breaks an existing doc suite built on the package;
- a changed fence contract — the `test` tag, `skip`, `only`, `name="..."`, test naming or `#N`
  suffixing — which silently stops running, or starts running, blocks in every consumer's docs;
- a behaviour change on one twin only (`typescript/` without `python/irondocs/`, or the reverse),
  or one whose `typescript/docs/` / `python/docs/` page was left as it was;
- a commit typed `feat` or `fix` that does not change what an installer gets, or a package change
  typed `chore`;
- a commit marked breaking (`!` or a `BREAKING CHANGE:` footer);
- `AGENTS.md`, a skill or `CONTRIBUTING.md` that the diff made untrue (**`human-documentation`**).

The relevant skill explains each of these — `human-documentation`, `change-verification`.

## How to report

Rate each finding **CRITICAL / HIGH / MEDIUM / LOW**, and say what input or sequence produces
the failure. A finding that cannot name the case that breaks is a hunch: either verify it or
leave it out.

Post specific issues as inline comments on the lines they concern. Keep the summary short.
Silence on the parts that are fine is not laziness — it is what makes the flagged parts legible.

If the change is good, say so briefly and stop. Do not manufacture findings to justify the run.

## Reviewing locally

With no pull request — a person running `/change-review` in a checkout, or `issue-resolution` before
it commits — the change is everything this branch adds over `main`: `git diff main...HEAD` plus the
uncommitted and untracked files. Judge it by the same rules, then print the findings in the terminal,
worst first, each with its `file:line`. Post nothing, and edit nothing unless the caller asks for the
fixes.
