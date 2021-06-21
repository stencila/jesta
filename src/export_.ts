import path from 'path'
import { Node } from '@stencila/schema'
import { Jesta } from '.'
import { MethodSchema, ParameterSchemas } from './manifest'
import { schema as writeSchema } from './write'

const { output, theme } = writeSchema.properties as ParameterSchemas

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
        'Format to export the documents to. Defaults to the file extension.',
      type: 'string',
      enum: ['json'],
    },
    downcast: {
      description: 'Downcast the document before it is exported?',
      type: 'boolean',
      // Constant `false` because Jesta does not implement the downcast method
      const: false,
    },
    validate: {
      description: 'Validate the document before it is exported?',
      type: 'boolean',
      const: true,
    },
    theme,
  },
}

export async function export_(
  this: Jesta,
  node: Node,
  output: string,
  format?: string,
  // These default to false because Jesta has neither capability
  downcast = false,
  validate = false,
  theme?: string
): Promise<string> {
  const downcasted = downcast ? await this.downcast(node) : node
  const validated = validate ? await this.validate(downcasted) : downcasted
  const encoded = await this.encode(
    validated,
    format ?? path.extname(output).slice(1),
    theme
  )
  return this.write(encoded, output)
}
