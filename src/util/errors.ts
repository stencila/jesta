/**
 * Base class for JSON-RPC errors
 *
 * The default code is the code for a generic server error.
 * See https://www.jsonrpc.org/specification#error_object
 */
export abstract class JsonRpcError extends Error {
  code: number

  data: unknown

  constructor(name: string, code: number, message: string, data?: unknown) {
    super(message)
    this.name = name
    this.code = code
    this.data = data
  }
}

/**
 * An error when a client sends invalid JSON
 */
export class ParseError extends JsonRpcError {
  constructor(details: string) {
    super(
      'ParseError',
      -32700,
      `Error while parsing request: ${details}`,
      details
    )
  }
}

/**
 * An error when a client sends an invalid request
 */
export class InvalidRequestError extends JsonRpcError {
  constructor() {
    super(
      'InvalidRequestError',
      -32600,
      'Request is invalid because it is missing an id or method'
    )
  }
}

/**
 * An error when the requested method does not exist
 */
export class MethodNotFoundError extends JsonRpcError {
  constructor(method: string) {
    super(
      'MethodNotFoundError',
      -32601,
      `Method '${method}' does not exist`,
      method
    )
  }
}

/**
 * An error when one of more parameters are invalid
 */
export class InvalidParamError extends JsonRpcError {
  constructor(message: string, errors: unknown) {
    super('InvalidParamError', -32602, message, errors)
  }
}

/**
 * A generic internal server error
 */
export class ServerError extends JsonRpcError {
  constructor(message: string) {
    super('ServerError', -32000, message)
  }
}

/**
 * An error when the plugin lacks the requested capability
 */
export class CapabilityError extends JsonRpcError {
  constructor(capability: string, params?: unknown) {
    super('CapabilityError', -32001, `Incapable of ${capability}`, params)
  }
}
