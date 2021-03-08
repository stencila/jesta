import { Jesta } from '.'
import { MethodSchema } from './types'

export const schema: MethodSchema = {
  title: 'convert',
  required: ['input', 'output'],
  properties: {
    input: {
      type: 'string',
      pattern: '^(file|https?):\\/\\/.+',
    },
    output: {
      type: 'string',
      pattern: '^file:\\/\\/.+',
    },
    from: {
      type: 'string',
    },
    to: {
      type: 'string',
    },
  },
}

export async function convert(
  this: Jesta,
  input: string,
  output: string,
  from: string,
  to: string,
  cached = true,
  upcast = false,
  downcast = false,
  validateInput = false,
  validateOutput = false
): Promise<string> {
  const imported = await this.import(input, from, cached, upcast, validateInput)
  return this.export(imported, output, to, downcast, validateOutput)
}
convert.schema = schema
