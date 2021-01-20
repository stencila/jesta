import { Node } from '@stencila/schema'
import readline from 'readline'
import { DispatchFunction } from './dispatch'
import {
  JsonRpcError,
  InvalidRequestError,
  ParseError,
  ServerError,
} from './utilities/errors'

/**
 * Serve the plugin.
 */
export const serve = (dispatcher: DispatchFunction): void => {
  const reader = readline.createInterface({
    input: process.stdin,
    terminal: false,
  })
  reader.on('line', (line) => {
    respond().catch((error: Error) =>
      // This should never be reached but keeps eslint happy
      // and does the right thing in case it is reached
      process.stdout.write(JSON.stringify({ error }) + '\n')
    )
    async function respond(): Promise<void> {
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
        const result = await dispatcher(method, params ?? {})
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
      const json = JSON.stringify(response)
      process.stdout.write(json + '\n')
    }
  })
}
