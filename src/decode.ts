import { Node } from '@stencila/schema'
import path from 'path'
import { Jesta } from '.'
import { read } from './util/read'

export async function decode(
  this: Jesta,
  input: string,
  format?: string
): Promise<Node> {
  format = format ?? path.extname(input).slice(1)

  if (format === 'json' || format.startsWith('application/json')) {
    const json = await read(input)
    return JSON.parse(json) as Node
  }

  throw Error(`Incapable of decoding from format "${format}"`)
}
