import { isEntity, Node } from '@stencila/schema'

export const visit = (node: Node, visitor: (node: Node) => void): void => {
  if (node === undefined || node == null || typeof node !== 'object') return
  for (const child of Object.values(node)) {
    isEntity(child) ? visitor(child) : visit(child, visitor)
  }
}

export const mutate = async <T>(
  node: T,
  mutator: (node: Node) => Promise<Node>
): Promise<T> => {
  if (node === undefined || node == null || typeof node !== 'object')
    return node
  for (const [key, child] of Object.entries(node)) {
    // eslint-disable-next-line
    ;(node as any)[key] = isEntity(child)
      ? await mutator(child)
      : await mutate(child, mutator)
  }
  return node
}

export const mutateSync = <T>(node: T, mutator: (node: Node) => Node): T => {
  if (node === undefined || node == null || typeof node !== 'object')
    return node
  for (const [key, child] of Object.entries(node)) {
    // eslint-disable-next-line
    ;(node as any)[key] = isEntity(child)
      ? mutator(child)
      : mutateSync(child, mutator)
  }
  return node
}
