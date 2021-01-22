import { Node } from '@stencila/schema'
import { methods as allMethods } from './methods'
import { Method, Methods, Dispatch } from './methods/types'
import { InvalidParamError, MethodNotFoundError } from './utilities/errors'

export const dispatch: Dispatch = (
  method: string,
  params: Record<string, Node | undefined>,
  methods: Methods = allMethods
): Promise<Node> => {
  const {
    build,
    clean,
    compile,
    decode,
    encode,
    enrich,
    execute,
    get,
    pipe,
    reshape,
    select,
    set,
    validate,
    vars,
  } = methods

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
      const { node, force } = params
      assert(node !== undefined, 'node')
      assert(
        force === undefined || typeof force === 'boolean',
        'force',
        'should be a boolean'
      )
      switch (method) {
        case Method.build:
          return build(node, force)
        case Method.clean:
          return clean(node)
        case Method.compile:
          return compile(node, force)
        case Method.enrich:
          return enrich(node)
        case Method.execute:
          return execute(node)
        case Method.reshape:
          return reshape(node)
        case Method.validate:
          return validate(node, force)
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
      assert(
        output === undefined || typeof output === 'string',
        'output',
        'should be a string'
      )
      assert(
        format === undefined || typeof format === 'string',
        'format',
        'should be a string'
      )
      return encode(node, output, format)
    }

    case Method.pipe: {
      const { node, calls } = params
      assert(node !== undefined, 'node')
      assert(
        Array.isArray(calls),
        'calls',
        'should be an array of method names'
      )
      return pipe(node, calls, dispatch, methods)
    }

    case Method.select: {
      const { node, query, lang } = params
      assert(node !== undefined, 'node')
      assert(typeof query === 'string', 'query', 'should be a string')
      assert(
        lang === undefined || typeof lang === 'string',
        'lang',
        'should be a string'
      )
      return select(node, query, lang)
    }

    case Method.vars: {
      return vars()
    }

    case Method.get: {
      const { name } = params
      assert(typeof name === 'string', 'name', 'should be a string')
      return get(name)
    }

    case Method.set: {
      const { name, value } = params
      assert(typeof name === 'string', 'name', 'should be a string')
      assert(value !== undefined, 'value')
      return set(name, value)
    }

    default:
      throw new MethodNotFoundError(method)
  }
}
