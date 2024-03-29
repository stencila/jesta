import { isEntity, Node } from '@stencila/schema'
import repl from 'repl'
import stream from 'stream'
import vm from 'vm'

export class Session {
  repl: repl.REPLServer

  context: vm.Context

  input: stream.PassThrough
  outputs: Node[] = []
  errors: Error[] = []

  constructor() {
    this.input = new stream.PassThrough()
    this.repl = repl.start({
      input: this.input,
      output: new stream.PassThrough(),
      writer: (result) => this.write(result),
      terminal: false,
      breakEvalOnSigint: true,
    })
    this.context = this.repl.context
  }

  write(result: Node | undefined): string {
    if (result !== undefined) {
      // Because the session is in a different runtime environment
      // it seems that `instanceof Error` does not work here
      // and that we need to use duck typing instead
      // See https://stackoverflow.com/a/45496068
      if (
        typeof result === 'object' &&
        result !== null &&
        !Array.isArray(result) &&
        !isEntity(result) &&
        typeof result?.message === 'string' &&
        typeof result?.stack === 'string'
      )
        this.errors.push(result as Error)
      else if (
        typeof result === 'object' &&
        result !== null &&
        'code' in result &&
        result.code === 'ERR_SCRIPT_EXECUTION_INTERRUPTED'
      ) {
        this.errors.push(new Error('Interrupted'))
      } else {
        this.outputs.push(result)
      }
    }
    // For some reason unless we return some string content
    // this function gets called twice
    return ' '
  }

  enter(code: string): [Node[], Error[]] {
    this.outputs = []
    this.errors = []
    this.input.write(code + '\n', 'utf8')
    return [this.outputs, this.errors]
  }
}

let sessionInstance: Session

/**
 * Get the session for the current document
 */
export function session(): Session {
  if (sessionInstance === undefined) {
    sessionInstance = new Session()
  }
  return sessionInstance
}
