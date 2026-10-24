import { Project } from "ts-morph"

/**
 * Create a fresh ts-morph project for parsing in-memory code snippets.
 */
export function createProject(): Project {
  return new Project({
    useInMemoryFileSystem: true,
    compilerOptions: { allowJs: true },
  })
}
