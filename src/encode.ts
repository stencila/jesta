import { Node } from '@stencila/schema'
import path from 'path'
import { Jesta } from '.'
import { write } from './util/write'

export async function encode(
  this: Jesta,
  node: Node,
  output?: string,
  format?: string
): Promise<string> {
  format =
    format ?? (output !== undefined ? path.extname(output).slice(1) : 'json')

  if (format === 'json' || format.startsWith('application/json')) {
    const json = JSON.stringify(node, null, '  ')
    if (output !== undefined) {
      await write(json, output)
      return ''
    } else return Promise.resolve(json)
  }

  throw Error(`Incapable of encoding to format "${format}"`)
}
