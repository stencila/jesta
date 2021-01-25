import { build } from './build'
import { clean } from './clean'
import { cli } from './cli'
import { compile } from './compile'
import { decode } from './decode'
import { dispatch } from './dispatch'
import { encode } from './encode'
import { execute } from './execute'
import { get } from './get'
import { manifest } from './manifest'
import { pipe } from './pipe'
import { Plugin } from './plugin'
import { register } from './register'
import { select } from './select'
import { serve } from './serve'
import { set } from './set'
import { vars } from './vars'

export class Jesta extends Plugin {
  manifest = manifest

  decode = decode
  encode = encode

  select = select

  compile = compile
  build = build
  execute = execute
  clean = clean

  get = get
  set = set
  vars = vars

  pipe = pipe
  dispatch = dispatch
  register = register
  serve = serve
  cli = cli
}

export * as schema from '@stencila/schema'
export * from './plugin'
export * as util from './util'

if (require.main === module) new Jesta().cli(__filename)
