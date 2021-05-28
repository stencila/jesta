#!/usr/bin/env node

import manifest from '../codemeta.json'
import { build } from './build'
import { call } from './call'
import { clean } from './clean'
import { cli } from './cli'
import { compile } from './compile'
import { convert } from './convert'
import { decode } from './decode'
import { delete_ } from './delete'
import { dispatch } from './dispatch'
import { downcast } from './downcast'
import { encode } from './encode'
import { enrich } from './enrich'
import { execute } from './execute'
import { export_ } from './export_'
import { funcs } from './funcs'
import { get } from './get'
import { import_ } from './import_'
import { pipe } from './pipe'
import { pull } from './pull'
import { read } from './read'
import { select } from './select'
import { serve } from './serve'
import { set } from './set'
import { Manifest } from './types'
import { upcast } from './upcast'
import { update } from './update'
import { validate } from './validate'
import { vars } from './vars'
import { write } from './write'

export class Jesta {
  manifest: Manifest = manifest as unknown as Manifest
  update = update

  read = read
  write = write

  pull = pull

  decode = decode
  encode = encode

  downcast = downcast
  upcast = upcast

  validate = validate
  enrich = enrich

  import = import_
  export = export_
  convert = convert

  select = select

  compile = compile
  build = build
  execute = execute
  clean = clean

  get = get
  set = set
  delete = delete_
  vars = vars

  funcs = funcs
  call = call

  dispatch = dispatch
  pipe = pipe

  serve = serve
  cli = cli
}

export * as logga from '@stencila/logga'
export * as schema from '@stencila/schema'
export * from './types'
export * as http from './util/http'

// istanbul ignore next
if (require.main === module) new Jesta().cli()
