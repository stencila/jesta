import { Node } from '@stencila/schema'
import path from 'path'
import { Jesta } from '.'

/**
 *
 * @param this
 * @param node
 * @param url
 * @param format
 * @returns A string to be written, or undefined if already written
 */
/* eslint-disable @typescript-eslint/require-await */
export async function encode(
  this: Jesta,
  node: Node,
  url?: string,
  format?: string
): Promise<string | undefined> {
  format = format ?? (url !== undefined ? path.extname(url).slice(1) : 'json')

  if (format === 'json' || format.startsWith('application/json')) {
    return JSON.stringify(node, null, '  ')
  }

  throw Error(`Incapable of encoding to format "${format}"`)
}
