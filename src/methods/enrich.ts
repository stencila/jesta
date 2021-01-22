import { Node } from '@stencila/schema'
import { Enrich } from './types'

// eslint-disable-next-line @typescript-eslint/require-await
export const enrich: Enrich = async (node: Node): Promise<Node> => {
  return node
}
