import { Node } from '@stencila/schema'
import { Jesta } from '.'
import { Method } from './plugin'
import { InvalidParamError, MethodNotFoundError } from './util/errors'

export function dispatch(
  this: Jesta,
  method: string,
  params: Record<string, Node | undefined>
): Promise<Node | undefined> {
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
      const { node, force = false } = params
      assert(node !== undefined, 'node')
      assert(
        force === undefined || typeof force === 'boolean',
        'force',
        'should be a boolean'
      )
      switch (method) {
        case Method.build:
          return this.build(node, force)
        case Method.clean:
          return this.clean(node)
        case Method.compile:
          return this.compile(node, force)
        case Method.enrich:
          return this.enrich(node)
        case Method.execute:
          return this.execute(node, force)
        case Method.reshape:
          return this.reshape(node)
        case Method.validate:
          return this.validate(node, force)
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
      return this.decode(input, format)
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
      return this.encode(node, output, format)
    }

    case Method.pipe: {
      const { node, calls } = params
      assert(node !== undefined, 'node')
      assert(
        Array.isArray(calls),
        'calls',
        'should be an array of method names'
      )
      return this.pipe(node, calls)
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
      return this.select(node, query, lang)
    }

    case Method.vars: {
      return this.vars()
    }

    case Method.get: {
      const { name } = params
      assert(typeof name === 'string', 'name', 'should be a string')
      return this.get(name)
    }

    case Method.set: {
      const { name, value } = params
      assert(typeof name === 'string', 'name', 'should be a string')
      assert(value !== undefined, 'value')
      return this.set(name, value)
    }
  }
  throw new MethodNotFoundError(method)
}
