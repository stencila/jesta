import { Node } from '@stencila/schema'

export const select = (node: Node, query: string, lang: string): Node => {
  if (lang === 'dotpath') {
    let value = node
    for (const property of query.split('.')) {
      // @ts-ignore
      if (value) value = value[property]
    }
    return value
  }

  throw Error(`Incapable of selecting with language "${lang}"`)
}
