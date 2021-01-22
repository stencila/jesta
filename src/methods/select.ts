import { Node } from '@stencila/schema'
import { Select } from './types'

/* eslint-disable @typescript-eslint/require-await */
export const select: Select = async (
  node: Node,
  query: string,
  lang = 'jspath'
): Promise<Node> => {
  if (lang === 'jspath') {
    const items = query.replace(/\[(\d+)\]/, '.$1').split('.')
    let value = node
    for (const property of items) {
      // eslint-disable-next-line
      // @ts-ignore
      // eslint-disable-next-line
      if (value !== undefined) value = value[property]
    }
    return value
  }

  throw Error(`Incapable of selecting with language "${lang}"`)
}
