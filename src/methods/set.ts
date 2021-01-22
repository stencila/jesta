import { Node } from '@stencila/schema'
import { context } from '../utilities/session'
import { Set } from './types'

// eslint-disable-next-line @typescript-eslint/require-await
export const set: Set = async (name: string, value: Node): Promise<null> => {
  context[name] = value
  return null
}
