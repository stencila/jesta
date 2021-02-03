import { codeError, isA, Node } from '@stencila/schema'
import { Jesta } from '.'
import { Method } from './plugin'
import { record } from './util/changes'
import { enter } from './util/session'
import * as timer from './util/timer'
import { mutate } from './util/walk'

export async function execute(
  this: Jesta,
  node: Node,
  force: boolean
): Promise<Node> {
  if (isA('CodeChunk', node)) {
    const { programmingLanguage, text } = node
    if (['js', 'javascript'].includes(programmingLanguage ?? '')) {
      // Ensure node has been built
      await this.build(node, force)

      const start = timer.start()

      // Enter code into REPL
      const [outputs, errors] = enter(text)

      // Update outputs
      if (outputs.length > 0) node.outputs = outputs
      else delete node.outputs

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

  return mutate(node, (node) => this.execute(node, force))
}