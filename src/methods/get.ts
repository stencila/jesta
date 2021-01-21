import { Node } from '@stencila/schema'
import { context } from '../utilities/session'

export const get = (name: string): Node => {
  return context[name] as Node
}
