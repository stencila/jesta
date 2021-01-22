import { nodeType } from '@stencila/schema'
import { context } from '../utilities/session'
import { Vars } from './types'

// A list of global variable names e.g. setTimeout which should not
// be included in the list of variables
const globals = Object.keys(globalThis)

/**
 * List variables of the current stencil.
 *
 * Returns a map of the name and type of
 * the current stencil's variables.
 */
// eslint-disable-next-line @typescript-eslint/require-await
export const vars: Vars = async (): Promise<Record<string, string>> => {
  return Object.entries(context).reduce(
    (prev, [name, value]) =>
      globals.includes(name) ? prev : { ...prev, [name]: nodeType(value) },
    {}
  )
}
