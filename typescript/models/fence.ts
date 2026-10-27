/**
 * A fence info string after its language: bare tokens (`test`, `skip`, `only`) and
 * `key="value"` attributes, the livemark convention.
 */
export type Fence = { options: string[]; attributes: Record<string, string> }
