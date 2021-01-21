import { JSONSchema7 } from 'json-schema'
import os from 'os'
import path from 'path'
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

interface System {
  os: 'linux' | 'macos' | 'windows' | 'other'
  endianness: 'big' | 'little'
  hostname: string
}

export type ManifestFunction = (system: System, cliPath: string) => Manifest

export const manifest: ManifestFunction = (
  system: System,
  cliPath: string
): Manifest => {
  const { name, ext } = path.parse(cliPath)
  const [command, ...args] = `${ext === '.js' ? 'node' : 'npm start --'} ${
    name === 'index' ? path.dirname(cliPath) : cliPath
  }`.split(/\s+/)

  return {
    version: 1,
    package: {
      // TODO: Populate from the plugin's package.json
      name: 'jesta',
      version: '0.1.0',
      description: 'Stencila plugin for Node.js',
    },
    addresses: [
      {
        transport: 'stdio',
        command,
        args,
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
}

/**
 * Generate system information to pass to a plugin's `manifest` function.
 */
export const system = (): System => {
  const { platform } = process

  let os_: System['os']
  if (platform === 'linux') os_ = 'linux'
  else if (platform === 'darwin') os_ = 'macos'
  else if (platform === 'win32') os_ = 'windows'
  else os_ = 'other'

  const endianness = os.endianness() === 'BE' ? 'big' : 'little'

  const hostname = os.hostname()

  return {
    os: os_,
    endianness,
    hostname,
  }
}
