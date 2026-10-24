/**
 * A render plugin tells the test-module renderer how to emit code for a
 * specific test runner. Currently just the optional initial import line
 * (null when the runner has globals like jest); room to grow later.
 */
export type Plugin = {
  initialImport: string | null
}
