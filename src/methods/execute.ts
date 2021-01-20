import { Entity, isA, Node } from '@stencila/schema'
import repl from 'repl'
import { record } from '../utilities/changes'
import * as timer from '../utilities/timer'
import { mutate } from '../utilities/walk'
import { Method } from './method'

// TODO: Use this or `vm` module?
let session: repl.REPLServer

export const execute = (node: Node): Node => {
  if (isA('CodeExpression', node) || isA('CodeBlock', node)) {
    const { programmingLanguage, text } = node
    if (['js', 'javascript'].includes(programmingLanguage ?? '')) {
      const start = timer.start()

      // TODO: Perform execution

      return record(node, Method.execute, timer.seconds(start))
    }
  }

  return node
  //return transform(node, execute)
}
