import { Node } from '@stencila/schema'
import { Reshape } from './types'

// eslint-disable-next-line @typescript-eslint/require-await
export const reshape: Reshape = async (node: Node): Promise<Node> => {
  return node
}
