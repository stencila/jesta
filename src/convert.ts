import { Jesta } from '.'
import { schema as importSchema } from './import_'
import { schema as exportSchema } from './export_'
import { MethodSchema, ParameterSchemas } from './manifest'

const {
  input,
  format: from,
  cache,
  upcast,
  validate,
} = importSchema.properties as ParameterSchemas

const {
  output,
  format: to,
  downcast,
} = exportSchema.properties as ParameterSchemas

export const schema: MethodSchema = {
  title: 'convert',
  type: 'object',
  required: ['input', 'output'],
  properties: {
    input,
    output,
    from,
    to,
    cache,
    upcast,
    downcast,
    validate,
  },
}

export async function convert(
  this: Jesta,
  input: string,
  output: string,
  from?: string,
  to?: string,
  cached = true,
  upcast = false,
  downcast = false,
  validate = false,
  theme?: string
): Promise<string> {
  const imported = await this.import(input, from, cached, upcast, validate)
  return this.export(imported, output, to, downcast, validate, theme)
}
convert.schema = schema
