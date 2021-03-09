import { Node } from '@stencila/schema'
import { Jesta } from '.'
import { MethodSchema } from './types'
import { session } from './util/session'

export const schema: MethodSchema = {
  title: 'get',
  description: 'Get a variable from a stencil.',
  required: ['stencil', 'name'],
  properties: {
    stencil: {
      description: 'The id of the stencil to get the variable from.',
      type: 'string',
    },
    name: {
      description: 'The name of the variable.',
      type: 'string',
    },
  },
}

// eslint-disable-next-line @typescript-eslint/require-await
export async function get(
  this: Jesta,
  stencil: string,
  name: string
): Promise<Node> {
  return session(stencil).context[name] as Node
}
get.schema = schema
