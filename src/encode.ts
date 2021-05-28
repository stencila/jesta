import { Node } from '@stencila/schema'
import { Jesta } from '.'
import { MethodSchema } from './types'
import { CapabilityError } from './util/errors'

export const schema: MethodSchema = {
  title: 'encode',
  description: 'Encode a Stencila node to content of a specific format.',
  required: ['node', 'format'],
  properties: {
    node: {
      description: 'The node to be encoded',
    },
    format: {
      description: 'The format to be encoded to',
      enum: ['json'],
    },
    theme: {
      description:
        'The theme for the exported content (only applies to some formats)',
      type: 'string',
    },
  },
  interruptible: false,
}

export async function encode(
  this: Jesta,
  node: Node,
  format: string,
  _theme?: string
): Promise<string> {
  if (format === 'json') {
    return Promise.resolve(JSON.stringify(node, null, '  '))
  } else {
    throw new CapabilityError(`encoding to format "${format}"`)
  }
}
encode.schema = schema
