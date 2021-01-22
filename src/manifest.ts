import { JSONSchema7 } from 'json-schema'
import { description, version } from '../package.json'
import { Method } from './methods'
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

export const manifest: Manifest = {
  version: 1,
  package: { name: 'jesta', version, description },
  addresses: [
    {
      transport: 'stdio',
      command: '',
      args: [],
      framing: 'nld',
      serialization: 'json',
    },
  ],
  capabilities: {
    select: {
      required: ['node', 'query', 'lang'],
      properties: {
        node: { type: 'object' },
        query: { type: 'string' },
        lang: { const: 'dotpath' },
      },
      interruptible: false,
    },
    encode: {
      required: ['node'],
      properties: {
        node: { type: 'object' },
        output: { type: 'string', pattern: '^(file|https?):\\/\\/.+' },
        format: { const: 'json' },
      },
      interruptible: false,
    },
    execute: {
      required: ['node'],
      properties: {
        node: { type: 'object' },
        output: { type: 'string', pattern: '^(file|https?):\\/\\/.+' },
        format: { const: 'json' },
      },
      interruptible: true,
    },
  },
}
