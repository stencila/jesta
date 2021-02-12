import { isEntity, isPrimitive, Node } from '@stencila/schema'
import repl from 'repl'
import stream from 'stream'
import vm from 'vm'

const input = new stream.PassThrough()

let outputs: Node[] = []
let errors: Error[] = []
function writer(result: Node | undefined): string {
  if (result !== undefined) {
    // Because the session is in a different runtime environment
    // it seems that `instanceof Error` does not work here
    // and that we need to use duck typing instead
    // See https://stackoverflow.com/a/45496068
    if (
      !isPrimitive(result) &&
      !Array.isArray(result) &&
      !isEntity(result) &&
      typeof result?.message === 'string' &&
      typeof result?.stack === 'string'
    )
      errors.push(result as Error)
    else if (
      !isPrimitive(result) &&
      'code' in result &&
      result.code === 'ERR_SCRIPT_EXECUTION_INTERRUPTED'
    ) {
      errors.push(new Error('Interrupted'))
    } else outputs.push(result)
  }
  // For some reason unless we return some string content
  // this function gets called twice
  return ' '
}

const session: repl.REPLServer = repl.start({
  input,
  output: new stream.PassThrough(),
  writer,
  terminal: false,
  breakEvalOnSigint: true,
})

export const context: vm.Context = session.context

export const enter = (code: string): [Node[], Error[]] => {
  outputs = []
  errors = []
  input.write(code + '\n', 'utf8')
  return [outputs, errors]
}
