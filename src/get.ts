import { Node } from '@stencila/schema'
import { Jesta } from '.'
import { MethodSchema } from './manifest'
import { session } from './util/session'

export const schema: MethodSchema = {
  title: 'get',
  description: 'Get a variable from a document.',
  required: ['name'],
  properties: {
    name: {
      description: 'The name of the variable.',
      type: 'string',
    },
  },
}

// eslint-disable-next-line @typescript-eslint/require-await
export async function get(this: Jesta, name: string): Promise<Node> {
  return session().context[name] as Node
}
get.schema = schema
