import { JSONSchema7 } from 'json-schema'
import { Jesta } from '.'
import { Method } from './types'

export type ParameterSchema = JSONSchema7

export type ParameterSchemas = Record<string, ParameterSchema>

export type MethodSchema = JSONSchema7 & {
  properties: ParameterSchemas
  interruptible?: boolean
}

/**
 * A plugin manifest
 */
export interface Manifest {
  name: string
  description: string
  softwareVersion: string
  installUrl: string[]
  featureList: MethodSchema[]
}

/**
 * Update the manifest for a plugin using declared schema of methods
 *
 * @param this The plugin instance.
 */
export function manifest(this: Jesta, base: Manifest): Manifest {
  const featureList = []
  for (const method of Object.keys(Method)) {
    // @ts-expect-error because indexing `Jesta`
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { schema } = this[method]
    if (schema !== undefined) {
      featureList.push(schema)
    }
  }
  return { ...base, featureList }
}
