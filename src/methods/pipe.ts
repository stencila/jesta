import { Node } from '@stencila/schema'
import { Dispatch } from '../dispatch'
import { Method } from './method'

export const pipe = async (
  node: Node,
  methods: Method[],
  dispatchFunction: Dispatch
): Promise<Node> => {
  for (const method of methods) {
    node = await dispatchFunction(method, { node })
  }
  return node
}
