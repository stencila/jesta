import { Node } from '@stencila/schema'
import { Jesta } from '.'
import { MethodSchema } from './types'
import { CapabilityError } from './util'

export const schema: MethodSchema = {
  title: 'decode',
  description: 'Decode content of a specific format into a Stencila node.',
  required: ['content', 'format'],
  properties: {
    content: {
      description: 'The content to be decoded',
      type: 'string',
    },
    format: {
      description: 'The format to be decoded from',
      enum: ['json'],
    },
  },
  interruptible: false,
}

export function decode(
  this: Jesta,
  content: string,
  format: string | undefined
): Promise<Node> {
  if (format === 'json') {
    return Promise.resolve(JSON.parse(content) as Node)
  } else {
    throw new CapabilityError(`decoding from format "${format ?? 'undefined'}"`)
  }
}
decode.schema = schema
