import { Node } from '@stencila/schema'
import { context } from '../utilities/session'
import { Get } from './types'

// eslint-disable-next-line @typescript-eslint/require-await
export const get: Get = async (name: string): Promise<Node> => {
  return context[name] as Node
}
