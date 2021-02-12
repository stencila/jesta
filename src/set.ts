import { Node } from '@stencila/schema'
import { Jesta } from '.'
import { session } from './util/session'

// eslint-disable-next-line @typescript-eslint/require-await
export async function set(
  this: Jesta,
  stencil: string,
  name: string,
  value: Node
): Promise<undefined> {
  session(stencil).context[name] = value
  return undefined
}
