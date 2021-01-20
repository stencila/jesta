import { Node } from '@stencila/schema'

export const select = (node: Node, query: string, lang: string): Node => {
  if (lang === 'dotpath') {
    let value = node
    for (const property of query.split('.')) {
      // eslint-disable-next-line
      // @ts-ignore
      // eslint-disable-next-line
      if (value !== undefined) value = value[property]
    }
    return value
  }

  throw Error(`Incapable of selecting with language "${lang}"`)
}
