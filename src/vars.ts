import { nodeType } from '@stencila/schema'
import { Jesta } from '.'
import { session } from './util/session'

/**
 * List variables of the current document.
 *
 * Returns a map of the name and type of the current document's variables.
 * See `funcs` for an analogous method returning functions and their type signature.
 */
// eslint-disable-next-line @typescript-eslint/require-await
export async function vars(
  this: Jesta,
  document: string
): Promise<Record<string, string>> {
  return Object.entries(session(document).context).reduce(
    (prev, [name, value]) =>
      name !== 'global' && typeof value !== 'function'
        ? { ...prev, [name]: nodeType(value) }
        : prev,
    {}
  )
}
