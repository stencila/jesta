import { Node } from '@stencila/schema'
import { Jesta } from '.'
import { Method } from './types'
import {
  assertRequiredParam,
  assertValidParam,
  MethodNotFoundError,
} from './util/errors'

export function dispatch(
  this: Jesta,
  method: string,
  params: Record<string, Node | undefined>
): Promise<Node | undefined> {
  switch (method) {
    case Method.build:
    case Method.clean:
    case Method.compile:
    case Method.enrich:
    case Method.execute:
    case Method.reshape:
    case Method.validate: {
      const { node, force = false } = params
      assertRequiredParam(node !== undefined, 'node')
      assertValidParam(
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
      assertRequiredParam(input !== undefined, 'input')
      assertValidParam(typeof input === 'string', 'input', 'should be a string')
      assertValidParam(
        format === undefined || typeof format === 'string',
        'format',
        'should be a string'
      )
      return this.decode(input, format)
    }

    case Method.encode: {
      const { node, output, format } = params
      assertRequiredParam(node !== undefined, 'node')
      assertValidParam(
        output === undefined || typeof output === 'string',
        'output',
        'should be a string'
      )
      assertValidParam(
        format === undefined || typeof format === 'string',
        'format',
        'should be a string'
      )
      return this.encode(node, output, format)
    }

    case Method.pipe: {
      const { node, calls } = params
      assertRequiredParam(node !== undefined, 'node')
      assertValidParam(
        Array.isArray(calls),
        'calls',
        'should be an array of method names'
      )
      return this.pipe(node, calls)
    }

    case Method.select: {
      const { node, query, lang } = params
      assertRequiredParam(node !== undefined, 'node')
      assertRequiredParam(query !== undefined, 'query')
      assertValidParam(typeof query === 'string', 'query', 'should be a string')
      assertValidParam(
        lang === undefined || typeof lang === 'string',
        'lang',
        'should be a string'
      )
      return this.select(node, query, lang)
    }

    case Method.vars: {
      return this.vars()
    }

    case Method.get:
    case Method.delete: {
      const { name } = params
      assertRequiredParam(name !== undefined, 'name')
      assertValidParam(typeof name === 'string', 'name', 'should be a string')
      return method === Method.get ? this.get(name) : this.delete(name)
    }

    case Method.set: {
      const { name, value } = params
      assertRequiredParam(name !== undefined, 'name')
      assertValidParam(typeof name === 'string', 'name', 'should be a string')
      assertRequiredParam(value !== undefined, 'value')
      return this.set(name, value)
    }
  }
  throw new MethodNotFoundError(method)
}
