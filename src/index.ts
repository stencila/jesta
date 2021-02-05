#!/usr/bin/env node

import { build } from './build'
import { clean } from './clean'
import { cli } from './cli'
import { compile } from './compile'
import { decode } from './decode'
import { delete_ } from './delete'
import { dispatch } from './dispatch'
import { encode } from './encode'
import { enrich } from './enrich'
import { execute } from './execute'
import { export_ } from './export_'
import { get } from './get'
import { import_ } from './import_'
import { manifest } from './manifest'
import { pipe } from './pipe'
import { read } from './read'
import { register } from './register'
import { reshape } from './reshape'
import { select } from './select'
import { serve } from './serve'
import { set } from './set'
import { validate } from './validate'
import { vars } from './vars'
import { write } from './write'

export class Jesta {
  // eslint-disable-next-line no-useless-constructor
  constructor(public file: string) {}

  manifest = manifest

  read = read
  write = write

  decode = decode
  encode = encode

  validate = validate
  reshape = reshape
  enrich = enrich

  import = import_
  export = export_

  select = select

  compile = compile
  build = build
  execute = execute
  clean = clean

  get = get
  set = set
  delete = delete_
  vars = vars

  pipe = pipe
  dispatch = dispatch
  register = register
  serve = serve
  cli = cli
}

export * as schema from '@stencila/schema'
export * from './types'
export * as util from './util'

// istanbul ignore next
if (require.main === module) new Jesta(__filename).cli()
