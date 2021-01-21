import { Node } from '@stencila/schema'
import { context } from '../utilities/session'

export const set = (name: string, value: Node): void => {
  context[name] = value
}
