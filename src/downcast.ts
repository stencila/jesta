import { Node } from '@stencila/schema'
import { Jesta } from '.'
import { CapabilityError } from './util'

/* eslint-disable @typescript-eslint/no-unused-vars */
export function downcast(this: Jesta, node: Node): Promise<Node> {
  throw new CapabilityError('downcast')
}
