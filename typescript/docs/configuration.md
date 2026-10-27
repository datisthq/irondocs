---
title: Configuration
path: /typescript/configuration/
icon: settings
order: 5
description: Wire irondocs into vitest, vite-plus, or jest.
---

# Configuration

Irondocs ships two consumer-facing entry points — one for the vite/vitest
ecosystem and one for jest. Pick the one that matches your test runner.

## vitest / vite-plus

`irondocs/vite` is a vite plugin. It transforms `.md` files into JS modules
that vitest evaluates as test files. The generated module uses a dynamic
import that resolves to `vite-plus/test` if installed, falling back to
`vitest`, so the same plugin works in both project types with no options.

```ts title="vite.config.ts"
import irondocs from "irondocs/vite"
import { defineConfig } from "vitest/config"

export default defineConfig({
  plugins: [irondocs()],
  test: {
    include: ["**/*.test.ts", "docs/**/*.md"],
  },
})
```

The exact include glob is up to you, but list only `.md` files that hold
`test` blocks: vitest fails a file with no tests ("No test suite found"), so a
broad `**/*.md` breaks the run on the first README without one.

## jest

`irondocs/jest` is a jest transformer. Register it under `transform`, add `md`
to `moduleFileExtensions` (jest ignores any file whose extension isn't listed
there, whatever `testMatch` says) and extend `testMatch` to include your `.md`
files. Generated tests rely on jest's default globals (`describe`/`it`/`expect`),
so no extra import is injected. As with vitest, every matched `.md` needs at
least one `test` block, or jest fails it.

```ts title="jest.config.ts"
export default {
  transform: { "\\.md$": "irondocs/jest" },
  moduleFileExtensions: ["js", "mjs", "cjs", "ts", "json", "md"],
  extensionsToTreatAsEsm: [".md"],
  testMatch: ["**/*.test.ts", "**/docs/**/*.md"],
}
```

If your jest setup disables globals (`injectGlobals: false`), add an explicit
`import { describe, it, expect } from "@jest/globals"` line inside one of your
runnable blocks — irondocs's import hoisting will lift it to the module top.

### ESM jest

A block's `import` statements stay ES module syntax, so a doc with imports
needs jest's ESM mode: `extensionsToTreatAsEsm: [".md"]` as above, and jest run
with `NODE_OPTIONS=--experimental-vm-modules`. A doc whose blocks import nothing
runs without it.
