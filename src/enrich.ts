import { Node } from '@stencila/schema'
import { Jesta } from '.'

/* eslint-disable @typescript-eslint/require-await, @typescript-eslint/no-unused-vars */
export function enrich(
  this: Jesta,
  node: Node,
  force?: boolean
): Promise<Node> {
  return Promise.resolve(node)
}
