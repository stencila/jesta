import path from 'path'

import { Jesta } from '.'
import { description, version } from '../package.json'
import { Manifest } from './types'

export function manifest(this: Jesta): Manifest {
  const { name: fileName, ext } = path.parse(this.file)
  const [command, ...args] = `${ext === '.js' ? 'node' : 'npx ts-node'} ${
    fileName === 'index' ? path.dirname(this.file) : this.file
  }`.split(/\s+/)

  return {
    version: 1,
    package: { name: 'jesta', version, description },
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
