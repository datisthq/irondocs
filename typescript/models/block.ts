/**
 * A runnable code block extracted from a markdown document, paired with the
 * heading that immediately precedes it (or the empty string when none does)
 * and any per-block options the author set in the fence info string.
 */
export type Block = {
  heading: string
  code: string
  name?: string
  skip?: boolean
  only?: boolean
}
