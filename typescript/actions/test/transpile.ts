import { ts } from "ts-morph"

/**
 * Compile a rendered test module from TypeScript to the JavaScript a runner can load:
 * types erased, unused and type-only imports elided, JSX on the automatic React runtime.
 */
export function transpileTestModule(code: string, options: { tsx: boolean }) {
  const result = ts.transpileModule(code, {
    fileName: options.tsx ? "__out.tsx" : "__out.ts",
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
    },
  })
  return result.outputText
}
