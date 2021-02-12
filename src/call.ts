import { Node } from '@stencila/schema'
import { Jesta } from '.'
import { session } from './util/session'

/**
 * Call a function within a stencil.
 *
 * @param name The name of the function
 * @param args Arguments to call the stencil or function with
 */
export async function call(
  this: Jesta,
  stencil: string,
  name: string,
  args: Record<string, Node>
): Promise<Node> {
  const func = session(stencil).context[name] as unknown
  // @ts-expect-error TODO check args against func type signature
  return (await func(...Object.values(args))) as Node
}
