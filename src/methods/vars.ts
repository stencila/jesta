import { nodeType } from '@stencila/schema'
import { context } from '../utilities/session'

export const vars = (): Record<string, string> => {
  return Object.entries(context).reduce(
    (prev, [name, value]) => ({ ...prev, [name]: nodeType(value) }),
    {}
  )
}
