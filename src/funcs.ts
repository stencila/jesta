import { Jesta } from '.'
import { session } from './util/session'

// A list of global variable names e.g. setTimeout which should not
// be included in the list of functions
const globals = Object.keys(globalThis)

/**
 * List functions of the current document.
 *
 * Returns a map of the name and type signature of the current document's functions.
 * See `vars` for an analogous method returning variables and their types.
 */
// eslint-disable-next-line @typescript-eslint/require-await
export async function funcs(this: Jesta): Promise<Record<string, string>> {
  return Object.entries(session().context).reduce(
    (prev, [name, value]) =>
      !globals.includes(name) && typeof value === 'function'
        ? { ...prev, [name]: funcType(value) }
        : prev,
    {}
  )
}

export function funcType(_func: () => void): string {
  // TODO
  return 'TODO'
}
