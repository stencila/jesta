import { Node } from '@stencila/schema'
import { Jesta } from '.'
import { MethodSchema } from './types'
import { session } from './util/session'

export const schema: MethodSchema = {
  title: 'set',
  description: 'Set a variable in a document.',
  required: ['name', 'value'],
  properties: {
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
  name: string,
  value: Node
): Promise<undefined> {
  session().context[name] = value
  return undefined
}
set.schema = schema
