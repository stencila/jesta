import { Node } from '@stencila/schema'
import { Jesta } from '.'
import { context } from './util/session'

/**
 * Call a function of the current stencil.
 */
// eslint-disable-next-line @typescript-eslint/require-await
export async function call(
  this: Jesta,
  name: string,
  args: Record<string, Node> = {}
): Promise<Node> {
  const func = context[name] as unknown
  // @ts-expect-error TODO check args against func type signature
  return func(...Object.values(args)) as Node
}
