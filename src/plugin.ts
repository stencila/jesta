import { Node } from '@stencila/schema'
import { JSONSchema7 } from 'json-schema'

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

export abstract class Plugin {
  abstract manifest(): Manifest

  /* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */

  decode(input: string, format?: string): Promise<Node> {
    return Promise.resolve(null)
  }

  encode(node: Node, output?: string, format?: string): Promise<string> {
    return Promise.resolve('')
  }

  validate(node: Node, force?: boolean): Promise<Node> {
    return Promise.resolve(node)
  }

  reshape(node: Node): Promise<Node> {
    return Promise.resolve(node)
  }

  enrich(node: Node): Promise<Node> {
    return Promise.resolve(node)
  }

  select(node: Node, query: string, lang?: string): Promise<Node> {
    return Promise.resolve(node)
  }

  compile(node: Node, force: boolean): Promise<Node> {
    return Promise.resolve(node)
  }

  build(node: Node, force: boolean): Promise<Node> {
    return Promise.resolve(node)
  }

  execute(node: Node, force: boolean): Promise<Node> {
    return Promise.resolve(node)
  }

  clean(node: Node): Promise<Node> {
    return Promise.resolve(node)
  }

  get(name: string): Promise<Node | undefined> {
    return Promise.resolve(undefined)
  }

  set(name: string, value: Node): Promise<undefined> {
    return Promise.resolve(undefined)
  }

  vars(): Promise<Record<string, string>> {
    return Promise.resolve({})
  }

  abstract pipe(node: Node, calls: Method[]): Promise<Node>

  abstract dispatch(
    method: string,
    params: Record<string, Node | undefined>
  ): Promise<Node | undefined>

  abstract register(): Promise<void>

  abstract serve(): void

  abstract cli(filePath: string): void

  /* eslint-enable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */
}
