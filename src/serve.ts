import { Node } from '@stencila/schema'
import readline from 'readline'
import { Jesta } from '.'
import { Method } from './plugin'
import {
  InvalidRequestError,
  JsonRpcError,
  ParseError,
  ServerError,
} from './util/errors'

/**
 * Serve the plugin.
 */
export function serve(this: Jesta): void {
  const manifest = this.manifest()

  // Turn on the default signal handler so that an errant SIGINT does
  // not stop the server
  defaultSigIntHandler()

  const reader = readline.createInterface({
    input: process.stdin,
    terminal: false,
  })
  reader.on('line', (line) => {
    const respond = async (): Promise<void> => {
      let id: number | undefined
      let response
      try {
        const request = JSON.parse(line) as {
          id?: number
          method?: string
          params?: Record<string, Node | undefined>
        }
        const { id: id_, method, params } = request
        if (id_ === undefined || method === undefined)
          throw new InvalidRequestError()
        id = id_

        // If the method is interruptible then it has it's own SIGINT handling,
        // so turn off this module's SIGINT handling. Otherwise, add a handler that provides
        // a notification that this request is not interruptible
        const { interruptible = false } =
          manifest.capabilities[method as Method] ?? {}
        if (interruptible) noSigIntHandler()
        else uninterruptibleSigIntHandler(id, method)

        const result = await this.dispatch(method, params ?? {})

        // Turn back on the default SIGINT handling
        defaultSigIntHandler()

        response = {
          id,
          result,
        }
      } catch (err) {
        const error =
          err instanceof JsonRpcError
            ? err
            : err instanceof SyntaxError
            ? new ParseError(err.message)
            : err instanceof Error
            ? new ServerError(err.stack ?? err.message)
            : new ServerError('Unknown error')

        const { code, message } = error
        response = {
          id,
          error: { code, message },
        }
      }
      send(response)
    }
    respond().catch((error: Error) =>
      // This should never be reached but keeps eslint happy
      // and does the right thing in case it is reached
      send({ error })
    )
  })
}

/**
 * On SIGINT, send a JSON-RPC notification that there is no
 * request currently being processed.
 */
const defaultSigIntHandler = (): void => {
  process.removeAllListeners('SIGINT')
  process.addListener('SIGINT', () => {
    send({
      method: 'warn',
      params: {
        message: 'No request is currently being processed; interrupt ignored.',
      },
    })
  })
}

/**
 * Remove all SIGINT handlers
 */
const noSigIntHandler = (): void => {
  process.removeAllListeners('SIGINT')
}

/**
 * On SIGINT, send a JSON-RPC notification that the current request
 * is uninterruptible.
 *
 * @param id Id of the current request
 * @param method Method of the current request
 */
const uninterruptibleSigIntHandler = (id: number, method: string): void => {
  process.removeAllListeners('SIGINT')
  process.addListener('SIGINT', () => {
    send({
      method: 'warn',
      params: {
        request: {
          id,
          method,
        },
        message: 'Request is uninterruptible',
      },
    })
  })
}

/**
 * Send a JSON-RPC message to the client
 *
 * This sends the message with,
 *   transport: stdio
 *   framing: nld
 *   serialization: json
 *
 * @param message The JSON-RPC response or notification
 */
const send = (message: unknown): void => {
  process.stdout.write(JSON.stringify(message) + '\n')
}
