import { Node } from '@stencila/schema'
import { Jesta } from '.'
import { Method } from './types'

export async function pipe(
  this: Jesta,
  node: Node,
  calls: Method[]
): Promise<Node> {
  for (const method of calls) {
    const result = await this.dispatch(method, { node })
    if (result === undefined) return node
    else node = result
  }
  return node
}
