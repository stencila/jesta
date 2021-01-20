import { Node } from '@stencila/schema'
import path from 'path'
import { read } from '../utilities/read'

export const decode = async (input: string, from?: string): Promise<Node> => {
  const format = from ?? path.extname(input).slice(1)

  if (format === 'json' || format.startsWith('application/json')) {
    const json = await read(input)
    return JSON.parse(json) as Node
  }

  throw Error(`Incapable of decoding from format "${format}"`)
}
