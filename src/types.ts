import { JSONSchema7 } from 'json-schema'

export enum Method {
  build = 'build',
  clean = 'clean',
  compile = 'compile',
  decode = 'decode',
  encode = 'encode',
  enrich = 'enrich',
  execute = 'execute',
  delete = 'delete',
  get = 'get',
  pipe = 'pipe',
  reshape = 'reshape',
  select = 'select',
  set = 'set',
  validate = 'validate',
  vars = 'vars',
}

/**
 * A description of the package that implements the plugin
 */
export interface Package {
  name: string
  version: string
  description: string
  url?: string
}

export interface BaseAddress {
  transport: 'stdio' | 'http' | 'ws'
  framing?: 'nld' | 'vlp'
  serialization: 'json' | 'cbor' | 'bincode'
}

export interface StdioAddress extends BaseAddress {
  transport: 'stdio'
  command: string
  args: string[]
  framing: 'nld' | 'vlp'
}

export interface HttpAddress extends BaseAddress {
  transport: 'http'
  url: string
}

export interface WebsocketAddress extends BaseAddress {
  transport: 'ws'
  url: string
}

export type Address = StdioAddress | HttpAddress | WebsocketAddress

export type MethodSchema = JSONSchema7 & { interruptible: boolean }

type Capabilities = {
  [key in Method]?: MethodSchema
}

/**
 * A plugin manifest
 */
export interface Manifest {
  version: 1
  package: Package
  addresses: Address[]
  capabilities: Capabilities
}
