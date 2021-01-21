import { isA, isEntity, Node } from '@stencila/schema'
import { mutate } from '../utilities/walk'

export const clean = (node: Node): Node => {
  if (!isEntity(node)) return node

  if (isA('CodeChunk', node)) {
    delete node.alters
    delete node.assigns
    delete node.declares
    delete node.imports
    delete node.reads
    delete node.uses
    delete node.outputs
    delete node.errors
  } else if (isA('CodeExpression', node)) {
    delete node.output
    delete node.errors
  }

  delete node.meta?.history
  if (node.meta && Object.keys(node.meta).length === 0) delete node.meta

  return mutate(node, clean)
}
