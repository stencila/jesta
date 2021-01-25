import { Node } from '@stencila/schema'
import { Jesta } from '.'

/* eslint-disable @typescript-eslint/require-await */
export async function select(
  this: Jesta,
  node: Node,
  query: string,
  lang = 'jspath'
): Promise<Node> {
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
