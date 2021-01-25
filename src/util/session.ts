import { isPrimitive, Node } from '@stencila/schema'
import repl from 'repl'
import stream from 'stream'

const input = new stream.PassThrough()

let outputs: Node[] = []
let errors: Error[] = []
function writer(result: Node | undefined): string {
  if (result !== undefined) {
    if (result instanceof Error) errors.push(result)
    else if (
      !isPrimitive(result) &&
      'code' in result &&
      result.code === 'ERR_SCRIPT_EXECUTION_INTERRUPTED'
    ) {
      errors.push(new Error('Interrupted'))
    } else outputs.push(result)
  }
  return ''
}

const session: repl.REPLServer = repl.start({
  input,
  output: new stream.PassThrough(),
  writer,
  terminal: false,
  breakEvalOnSigint: true,
})

export const context = session.context

export const enter = (code: string): [Node[], Error[]] => {
  outputs = []
  errors = []
  input.write(code + '\n', 'utf8')
  return [outputs, errors]
}
