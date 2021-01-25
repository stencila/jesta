import { Node } from '@stencila/schema'
import { Jesta } from '.'
import { context } from './util/session'

// eslint-disable-next-line @typescript-eslint/require-await
export async function set(
  this: Jesta,
  name: string,
  value: Node
): Promise<undefined> {
  context[name] = value
  return undefined
}
