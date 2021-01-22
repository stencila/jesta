import { Node } from '@stencila/schema'
import { Validate } from './types'

/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/require-await */
export const validate: Validate = async (
  node: Node,
  force = true
): Promise<Node> => {
  return node
}
