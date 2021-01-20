import { Entity, Node } from '@stencila/schema'
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

export type DispatchFunction = (
  method: Method,
  params: Record<string, unknown>
) => Node

export const dispatch: DispatchFunction = (
  method: Method,
  params: Record<string, unknown>
): Node => {
  switch (method) {
    case Method.build: {
      const { node } = params
      return build(node as Entity)
    }
    case Method.clean: {
      const { node } = params
      return clean(node as Entity)
    }
    case Method.compile: {
      const { node } = params
      return compile(node as Entity)
    }
    case Method.decode: {
      const { input, format } = params
      return decode(input as string, format as string)
    }
    case Method.encode: {
      const { node, output, format } = params
      return encode(node as Entity, output as string, format as string)
    }
    case Method.enrich: {
      const { node } = params
      return enrich(node as Entity)
    }
    case Method.execute: {
      const { node } = params
      return execute(node as Entity)
    }
    case Method.reshape: {
      const { node } = params
      return reshape(node as Entity)
    }
    case Method.select: {
      const { node, query, lang } = params
      return select(node as Entity, query as string, lang as string)
    }
    case Method.validate: {
      const { node } = params
      return validate(node as Entity)
    }
  }
}
