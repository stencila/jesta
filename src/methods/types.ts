import { Node } from '@stencila/schema'

export enum Method {
  build = 'build',
  clean = 'clean',
  compile = 'compile',
  decode = 'decode',
  encode = 'encode',
  enrich = 'enrich',
  execute = 'execute',
  get = 'get',
  pipe = 'pipe',
  reshape = 'reshape',
  select = 'select',
  set = 'set',
  validate = 'validate',
  vars = 'vars',
}

export type Dispatch = (
  method: string,
  params: Record<string, Node | undefined>,
  methods?: Methods
) => Promise<Node>

export type Build = (
  methods: Methods,
  node: Node,
  force: boolean
) => Promise<Node>
export type Clean = (node: Node) => Promise<Node>
export type Compile = (
  methods: Methods,
  node: Node,
  force: boolean
) => Promise<Node>
export type Decode = (input: string, format?: string) => Promise<Node>
export type Encode = (
  node: Node,
  output?: string,
  format?: string
) => Promise<string>
export type Enrich = (node: Node) => Promise<Node>
export type Execute = (
  methods: Methods,
  node: Node,
  force: boolean
) => Promise<Node>
export type Get = (name: string) => Promise<Node>
export type Pipe = (
  node: Node,
  calls: Method[],
  dispatch: Dispatch,
  methods: Methods
) => Promise<Node>
export type Reshape = (node: Node) => Promise<Node>
export type Select = (node: Node, query: string, lang?: string) => Promise<Node>
export type Set = (name: string, value: Node) => Promise<null>
export type Validate = (node: Node, force?: boolean) => Promise<Node>
export type Vars = () => Promise<Record<string, string>>

export interface Methods {
  build: Build
  clean: Clean
  compile: Compile
  decode: Decode
  encode: Encode
  enrich: Enrich
  execute: Execute
  get: Get
  pipe: Pipe
  reshape: Reshape
  select: Select
  set: Set
  validate: Validate
  vars: Vars
}
