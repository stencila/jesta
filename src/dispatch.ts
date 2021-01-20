import { Node } from '@stencila/schema'

export type DispatchFunction = () => Node

export const dispatch: DispatchFunction = (): Node => {
  return ''
}
