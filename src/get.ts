import { Node } from '@stencila/schema'
import { Jesta } from '.'
import { session } from './util/session'

// eslint-disable-next-line @typescript-eslint/require-await
export async function get(
  this: Jesta,
  stencil: string,
  name: string
): Promise<Node> {
  return session(stencil).context[name] as Node
}
