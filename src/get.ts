import { Node } from '@stencila/schema'
import { Jesta } from '.'
import { context } from './util/session'

// eslint-disable-next-line @typescript-eslint/require-await
export async function get(this: Jesta, name: string): Promise<Node> {
  return context[name] as Node
}
