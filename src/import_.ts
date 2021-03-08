import { Node } from '@stencila/schema'
import { Jesta } from '.'
import { MethodSchema } from './types'

export const schema: MethodSchema = {
  title: 'import',
  description:
    'Import a node from a URL (including a `file://` or `string://` URL).',
  required: ['url'],
  properties: {
    url: {
      description: 'URL to import the node from.',
      type: 'string',
      pattern: '^(file|https?|string):\\/\\/.+',
    },
    format: {
      description:
        "Format to import the node from. Defaults to the URL's media type or file extension.",
      type: 'string',
      const: 'json',
    },
    cached: {
      description: 'Allow cached content to be used (for http:// URLs).',
      type: 'boolean',
    },
    upcast: {
      description: 'Upcast the imported node.',
      type: 'boolean',
      // Constant `false` because Jesta does not implement the upcast method
      const: false,
    },
    validate: {
      description: 'Validate the imported node.',
      type: 'boolean',
      // Constant `false` because Jesta does not implement the validate method
      const: false,
    },
  },
}

export async function import_(
  this: Jesta,
  url: string,
  format?: string,
  cached = true,
  // These default to false because Jesta has neither capability
  upcast = false,
  validate = false
): Promise<Node> {
  const [content, formatRead] = await this.read(url, cached)
  const decoded = await this.decode(content, format ?? formatRead)
  const validated = validate ? await this.validate(decoded) : decoded
  return upcast ? this.upcast(validated) : validated
}
import_.schema = schema
