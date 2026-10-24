# Irondocs

Run TypeScript code blocks from your markdown docs as real vitest or jest
tests. Mark a fenced block with `test`, and it becomes a runnable assertion —
no separate test file, no boilerplate, no drift between docs and code.

## Install

```bash
pnpm add -D irondocs
# or
npm install --save-dev irondocs
```

## Write a doctest

Add `test` to any TypeScript fence in any `.md` file. The block's body becomes
the body of an `it()` named after the nearest preceding heading. `describe`,
`it`, and `expect` are injected for you.

````md
```ts test
import { sum } from "./sum.ts"
expect(sum(1, 2)).toBe(3)
```
````

Untagged `ts` blocks render normally and are not run, so you can mix
illustrative snippets and runnable assertions in the same article.

## Wire it into your test runner

For vitest (or vite-plus), add the plugin and put `.md` in `test.include`:

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

For jest, register the transformer:

```ts title="jest.config.ts"
export default {
  transform: { "\\.md$": "irondocs/jest" },
  testMatch: ["**/*.test.ts", "**/docs/**/*.md"],
}
```

Run your usual `pnpm test` — your `.md` files now run alongside your `*.test.ts`
files. See [Writing tests](/typescript/writing-tests/) for the marker syntax,
[Running tests](/typescript/running-tests/) for what to expect at the terminal, and
[Configuration](/typescript/configuration/) for runner-specific notes.
