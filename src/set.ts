import { Node } from '@stencila/schema'
import { Jesta } from '.'
import { MethodSchema } from './types'
import { session } from './util/session'

export const schema: MethodSchema = {
  title: 'set',
  description: 'Set a variable in a stencil.',
  required: ['stencil', 'name', 'value'],
  properties: {
    stencil: {
      description: 'The id of the stencil to set the variable in.',
      type: 'string',
    },
    name: {
      description: 'The name of the variable to set.',
      type: 'string',
    },
    value: {
      description: 'The value to to set the variable to.',
    },
  },
}

// eslint-disable-next-line @typescript-eslint/require-await
export async function set(
  this: Jesta,
  stencil: string,
  name: string,
  value: Node
): Promise<undefined> {
  session(stencil).context[name] = value
  return undefined
}
set.schema = schema
