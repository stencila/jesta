import { isEntity, isPrimitive, Node } from '@stencila/schema'

export const visit = (node: Node, visitor: (node: Node) => void): void => {
  if (isPrimitive(node)) return
  for (const child of Object.values(node)) {
    isEntity(child) ? visitor(child) : visit(child, visitor)
  }
}

export const mutate = <T>(node: T, mutator: (node: Node) => Node): T => {
  if (node === undefined || isPrimitive(node)) return node
  for (const [key, child] of Object.entries(node)) {
    // eslint-disable-next-line
    ;(node as any)[key] = isEntity(child)
      ? mutator(child)
      : mutate(child, mutator)
  }
  return node
}
