import { build } from './build'
import { clean } from './clean'
import { compile } from './compile'
import { decode } from './decode'
import { encode } from './encode'
import { enrich } from './enrich'
import { execute } from './execute'
import { get } from './get'
import { pipe } from './pipe'
import { reshape } from './reshape'
import { select } from './select'
import { set } from './set'
import { Methods } from './types'
import { validate } from './validate'
import { vars } from './vars'

export * from './build'
export * from './clean'
export * from './compile'
export * from './decode'
export * from './encode'
export * from './enrich'
export * from './execute'
export * from './get'
export * from './pipe'
export * from './reshape'
export * from './select'
export * from './set'
export * from './types'
export * from './validate'
export * from './vars'

export const methods: Methods = {
  build,
  clean,
  compile,
  decode,
  encode,
  enrich,
  execute,
  get,
  pipe,
  reshape,
  select,
  set,
  validate,
  vars,
}
