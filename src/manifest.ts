import { JSONSchema7 } from 'json-schema'
import os from 'os'
import path from 'path'

type MethodSchema = JSONSchema7

export interface Manifest {
  name: string
  version: string
  description: string
  command: string
  methods: {
    decode?: MethodSchema
    encode?: MethodSchema

    select?: MethodSchema

    validate?: MethodSchema
    reshape?: MethodSchema
    enrich?: MethodSchema

    compile?: MethodSchema
    build?: MethodSchema
    execute?: MethodSchema
  }
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
  return {
    name: 'jesta',
    version: '0.1.0',
    description: 'Develop Stencila plugins using Node.js',
    command: command(cliPath),
    methods: {
      // execute: true,
      // compile: true,
      select: {
        required: ['node', 'query', 'lang'],
        properties: {
          node: { type: 'object' },
          query: { type: 'string' },
          lang: { const: 'dotpath' },
        },
      },
      // convert: true,
      // decode: true,
      encode: {
        required: ['node'],
        properties: {
          node: { type: 'object' },
          output: { type: 'string', pattern: '^(file|https?):\\/\\/.+' },
          format: { const: 'json' },
        },
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

/**
 * Generate a `command` string for a plugin's manifest.
 *
 * This function provides a convienient way to generate the `command`
 * property of a plugin's manifest. Use it in the `manifest` function like this:
 *
 * ```js
 * {
 *   name: "exampla",
 *   description: "An example Stencila plugin developed using Node.js",
 *   command: command(__filename)
 * }
 * ```
 *
 * @param filePathAbs The absolute path to the plugin's main file
 */
export const command = (filePathAbs: string): string => {
  let filePathRel = path.relative(process.cwd(), filePathAbs)
  const { name, ext } = path.parse(filePathRel)
  if (name === 'index') filePathRel = path.dirname(filePathRel)

  return `${ext === '.js' ? 'node' : 'npx ts-node'} ${filePathRel}`
}
