import path from 'path'
import { Node } from '@stencila/schema'
import { Jesta } from '.'
import { MethodSchema, ParameterSchemas } from './types'
import { schema as writeSchema } from './write'

const { output } = writeSchema.properties as ParameterSchemas

export const schema: MethodSchema = {
  title: 'export',
  description:
    'Export a node to a URL (including a `file://` or `string://` URL).',
  required: ['node', 'output'],
  properties: {
    node: {
      description: 'The node to export.',
    },
    output,
    format: {
      description:
        "Format to export the node to. Defaults to the URL's file extension.",
      type: 'string',
      const: 'json',
    },
    downcast: {
      description: 'Downcast the exported node.',
      type: 'boolean',
      // Constant `false` because Jesta does not implement the downcast method
      const: false,
    },
    validate: {
      description: 'Validate the exported node.',
      type: 'boolean',
      // Constant `false` because Jesta does not implement the validate method
      const: false,
    },
  },
}

export async function export_(
  this: Jesta,
  node: Node,
  output: string,
  format?: string,
  // These default to false because Jesta has neither capability
  downcast = false,
  validate = false
): Promise<string> {
  const downcasted = downcast ? await this.downcast(node) : node
  const validated = validate ? await this.validate(downcasted) : downcasted
  const encoded = await this.encode(
    validated,
    format ?? path.extname(output).slice(1)
  )
  return this.write(encoded, output)
}
