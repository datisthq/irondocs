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

The exact include glob is up to you — narrow to `docs/**/*.md` if you only
want runnable docs in the docs folder, or expand to `**/*.md` if you want
README and other top-level markdown discovered too.

## jest

`irondocs/jest` is a jest transformer. Register it under `transform` and
extend `testMatch` to include your `.md` files. Generated tests rely on jest's
default globals (`describe`/`it`/`expect`), so no extra import is injected.

```ts title="jest.config.ts"
export default {
  transform: { "\\.md$": "irondocs/jest" },
  testMatch: ["**/*.test.ts", "**/docs/**/*.md"],
}
```

If your jest setup disables globals (`injectGlobals: false`), add an explicit
`import { describe, it, expect } from "@jest/globals"` line inside one of your
runnable blocks — irondocs's import hoisting will lift it to the module top.

### ESM jest

Irondocs is published as ESM. Default-CJS jest setups need ESM mode to load
it — typically via `--experimental-vm-modules` and matching
`extensionsToTreatAsEsm` config. Refer to the jest docs for the full
ESM-mode setup; it isn't irondocs-specific.
