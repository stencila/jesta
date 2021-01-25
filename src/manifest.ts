import { Jesta } from '.'
import { description, version } from '../package.json'
import { Manifest } from './plugin'

export function manifest(this: Jesta): Manifest {
  return {
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
}
