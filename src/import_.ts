import { Node } from '@stencila/schema'
import { Jesta } from '.'
import { MethodSchema, ParameterSchemas } from './types'
import { schema as readSchema } from './read'

const { input, cache } = readSchema.properties as ParameterSchemas

export const schema: MethodSchema = {
  title: 'import',
  description:
    'Import a node from a URL (including a `file://` or `string://` URL).',
  required: ['input'],
  properties: {
    input,
    format: {
      description:
        'Format to import the node from. Defaults to the file extension or media type.',
      type: 'string',
      const: 'json',
    },
    cache,
    upcast: {
      description: 'Upcast the imported node.',
      type: 'boolean',
      // Constant `false` because Jesta does not implement the upcast method
      const: false,
    },
    validate: {
      description: 'Validate the imported node.',
      type: 'boolean',
      const: true,
    },
  },
}

export async function import_(
  this: Jesta,
  input: string,
  format?: string,
  cache = true,
  // These default to false because Jesta has neither capability
  upcast = false,
  validate = false
): Promise<Node> {
  const [content, formatRead] = await this.read(input, cache)
  const decoded = await this.decode(content, format ?? formatRead)
  const validated = validate ? await this.validate(decoded) : decoded
  return upcast ? this.upcast(validated) : validated
}
import_.schema = schema
