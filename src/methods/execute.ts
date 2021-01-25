import { codeError, isA, Node } from '@stencila/schema'
import { record } from '../utilities/changes'
import { enter } from '../utilities/session'
import * as timer from '../utilities/timer'
import { mutate } from '../utilities/walk'
import { Execute, Method, Methods } from './types'

export const execute: Execute = async (
  methods: Methods,
  node: Node,
  force: boolean
): Promise<Node> => {
  if (isA('CodeChunk', node)) {
    const { programmingLanguage, text } = node
    if (['js', 'javascript'].includes(programmingLanguage ?? '')) {
      // Ensure node has been built
      await methods.build(methods, node, force)

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

  return mutate(node, (node) => execute(methods, node, force))
}
