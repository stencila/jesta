import { Node } from '@stencila/schema'
import { Dispatch, Method, Methods, Pipe } from './types'

export const pipe: Pipe = async (
  node: Node,
  calls: Method[],
  dispatch: Dispatch,
  methods: Methods
): Promise<Node> => {
  for (const method of calls) {
    node = await dispatch(method, { node }, methods)
  }
  return node
}
