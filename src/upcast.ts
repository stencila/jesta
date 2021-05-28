import { Node } from '@stencila/schema'
import { Jesta } from '.'
import { CapabilityError } from './util/errors'

/* eslint-disable @typescript-eslint/no-unused-vars */
export function upcast(this: Jesta, node: Node): Promise<Node> {
  throw new CapabilityError('upcast')
}
