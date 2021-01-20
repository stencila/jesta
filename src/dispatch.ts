import { Node } from '@stencila/schema'
import { Method } from './methods/method'
import {
  build,
  clean,
  compile,
  decode,
  encode,
  enrich,
  execute,
  reshape,
  select,
  validate,
} from './methods'
import { pipe } from './methods/pipe'
import { InvalidParamError, MethodNotFoundError } from './utilities/errors'

export type DispatchFunction = (
  method: string,
  params: Record<string, Node | undefined>
) => Promise<Node>

export const dispatch: DispatchFunction = async (
  method: string,
  params: Record<string, Node | undefined>
): Promise<Node> => {
  function assert(
    condition: boolean,
    param: string,
    message = 'missing'
  ): asserts condition {
    if (!condition) throw new InvalidParamError(method, param, message)
  }
  switch (method) {
    case Method.build:
    case Method.clean:
    case Method.compile:
    case Method.enrich:
    case Method.execute:
    case Method.reshape:
    case Method.validate: {
      const { node } = params
      assert(node !== undefined, 'node')
      switch (method) {
        case Method.build:
          return build(node)
        case Method.clean:
          return clean(node)
        case Method.compile:
          return compile(node)
        case Method.enrich:
          return enrich(node)
        case Method.execute:
          return execute(node)
        case Method.reshape:
          return reshape(node)
        case Method.validate:
          return validate(node)
      }
      break
    }

    case Method.decode: {
      const { input, format } = params
      assert(typeof input === 'string', 'input', 'should be a string')
      assert(
        format === undefined || typeof format === 'string',
        'format',
        'should be a string'
      )
      return decode(input, format)
    }

    case Method.encode: {
      const { node, output, format } = params
      assert(node !== undefined, 'node')
      assert(typeof output === 'string', 'output', 'should be a string')
      assert(
        format === undefined || typeof format === 'string',
        'format',
        'should be a string'
      )
      return encode(node, output, format)
    }

    case Method.pipe: {
      const { node, methods } = params
      assert(node !== undefined, 'node')
      assert(
        Array.isArray(methods),
        'methods',
        'should be an array of method names'
      )
      return pipe(node, methods, dispatch)
    }

    case Method.select: {
      const { node, query, lang } = params
      assert(node !== undefined, 'node')
      assert(typeof query === 'string', 'query', 'should be a string')
      assert(typeof lang === 'string', 'lang', 'should be a string')
      return select(node, query, lang)
    }

    default:
      throw new MethodNotFoundError(method)
  }
}
