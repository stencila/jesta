import { Entity } from '@stencila/schema'
import path from 'path'
import { read } from '../utilities/read'

export const decode = async (input: string, from?: string): Promise<Entity> => {
  const format = from ?? path.extname(input).slice(1)

  if (format === 'json' || format.startsWith('application/json')) {
    const json = await read(input)
    return JSON.parse(json) as Entity
  }

  throw Error(`Incapable of decoding from format "${format}"`)
}
