import { Node } from '@stencila/schema'

export const select = (node: Node, query: string, lang = 'jspath'): Node => {
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
