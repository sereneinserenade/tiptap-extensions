export interface Demo {
  id: string
  title: string
  summary: string
  importName: string
  /** Builds the demo inside `root` and returns a cleanup function. */
  mount: (root: HTMLElement) => () => void
}
