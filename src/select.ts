import { Node } from '@stencila/schema'
import { Jesta } from '.'
import { MethodSchema } from './manifest'

export const schema: MethodSchema = {
  title: 'select',
  description: 'Select child nodes from a node.',
  required: ['node', 'query'],
  properties: {
    node: {
      description: 'The node to select from.',
    },
    query: {
      description: 'The query to run against the node.',
      type: 'string',
    },
    lang: {
      description: 'The language that the query is written in.',
      enum: ['simplepath'],
    },
  },
}

/* eslint-disable @typescript-eslint/require-await */
export async function select(
  this: Jesta,
  node: Node,
  query: string,
  lang = 'simplepath'
): Promise<Node> {
  if (lang === 'simplepath') {
    const items = query.replace(/\[(\d+)\]/, '.$1').split('.')
    let value = node
    for (const property of items) {
      // eslint-disable-next-line
      // @ts-ignore
      // eslint-disable-next-line
      if (value !== undefined) value = value[property]
    }
    return value
  }

  throw Error(`Incapable of selecting with language "${lang}"`)
}
select.schema = schema
