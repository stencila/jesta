import { codeError, isA, Node } from '@stencila/schema'
import { Jesta } from '.'
import { Method } from './types'
import { record } from './util/changes'
import { session } from './util/session'
import * as timer from './util/timer'
import { mutate } from './util/walk'

export async function execute(
  this: Jesta,
  document: string,
  node: Node,
  force: boolean
): Promise<Node> {
  if (isA('CodeChunk', node) || isA('CodeExpression', node)) {
    const { programmingLanguage, text } = node
    if (['js', 'javascript'].includes(programmingLanguage ?? '')) {
      // Ensure node has been built
      await this.build(node, force)

      const start = timer.start()

      // Enter code into REPL
      const [outputs, errors] = session(document).enter(text)

      // Update outputs
      if (isA('CodeChunk', node)) {
        if (outputs.length > 0) node.outputs = outputs
        else delete node.outputs
      } else {
        // There should only be one output but in case there are more
        // only take the last
        if (outputs.length > 0) node.output = outputs.slice(-1)[0]
        else delete node.output
      }

      // Update errors
      if (errors.length > 0)
        node.errors = errors.map((error) => {
          const { name, message, stack } = error
          return codeError({
            errorType: name,
            errorMessage: message,
            stackTrace: stack?.split('\n').slice(2).join('\n'),
          })
        })
      else delete node.errors

      return record(node, Method.execute, timer.seconds(start))
    }
  }

  return mutate(node, (node) => this.execute(document, node, force))
}
