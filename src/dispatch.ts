import { Node } from '@stencila/schema'
import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import { Jesta } from '.'
import { Method } from './types'
import { InvalidParamError, MethodNotFoundError } from './util/errors'

const validators: Ajv = addFormats(new Ajv({ strict: false }))

export function dispatch(
  this: Jesta,
  method: string,
  params: Record<string, Node | undefined>
): Promise<Node | undefined> {
  // Check this is a known method
  if (Method[method as Method] === undefined)
    throw new MethodNotFoundError(method)

  // Get the validation function for the method
  let validator = validators.getSchema(method)
  if (validator === undefined) {
    // @ts-expect-error because indexing `Jesta`
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { schema } = this[method]
    if (schema !== undefined) {
      validator = validators.addSchema(schema, method).getSchema(method)
    }
  }

  // Validate the supplied parameter against the method's schema (if any)
  if (validator) {
    if (validator(params) !== true) {
      const errors = validator.errors ?? []
      let messages: string[] = []
      for (const error of errors) {
        // Convert error message into something that is more easily digestible
        // by humans
        const { instancePath, message, params } = error
        if (instancePath !== '' && message !== undefined) {
          messages = [
            ...messages,
            `Parameter '${instancePath.slice(1)}' is invalid: ${message}.`,
          ]
        } else if (params.missingProperty !== undefined) {
          messages = [
            ...messages,
            `Parameter '${params.missingProperty as string}' is required.`,
          ]
        } else {
          messages = [...messages, `Parameters are invalid`]
        }
      }
      throw new InvalidParamError(messages.join(' '), errors)
    }
  }

  // Dispatch to the method
  switch (method as Method) {
    // case Method.build:
    //  return this.build(params.node as Node, params.force as boolean)
    case Method.call:
      return this.call(
        params.document as string,
        params.name as string,
        params.args as Record<string, Node>
      )
    case Method.clean:
      return this.clean(params.node as Node)
    case Method.compile:
      return this.compile(params.node as Node, params.force as boolean)
    case Method.convert:
      return this.convert(
        params.input as string,
        params.output as string,
        params.from as string,
        params.to as string,
        params.cache as boolean,
        params.upcast as boolean,
        params.downcast as boolean,
        params.validate as boolean
      )
    case Method.decode:
      return this.decode(params.content as string, params.format as string)
    case Method.delete:
      return this.delete(params.document as string, params.name as string)
    case Method.downcast:
      return this.downcast(params.node as Node)
    case Method.encode:
      return this.encode(params.node as Node, params.format as string)
    case Method.enrich:
      return this.enrich(params.node as Node, params.force as boolean)
    case Method.execute:
      return this.execute(
        params.document as string,
        params.node as Node,
        params.force as boolean
      )
    case Method.export:
      return this.export(
        params.node as Node,
        params.output as string,
        params.format as string,
        params.downcast as boolean,
        params.validate as boolean
      )
    case Method.funcs:
      return this.funcs(params.document as string)
    case Method.get:
      return this.get(params.document as string, params.name as string)
    case Method.import:
      return this.import(
        params.input as string,
        params.format as string,
        params.cache as boolean,
        params.upcast as boolean,
        params.validate as boolean
      )
    case Method.pipe:
      return this.pipe(params.node as Node, params.calls as Method[])
    case Method.read:
      return this.read(params.input as string, params.cache as boolean)
    case Method.select:
      return this.select(
        params.node as Node,
        params.query as string,
        params.lang as string
      )
    case Method.set:
      return this.set(
        params.document as string,
        params.name as string,
        params.value as Node
      )
    case Method.upcast:
      return this.upcast(params.node as Node)
    case Method.validate:
      return this.validate(params.node as Node, params.force as boolean)
    case Method.vars:
      return this.vars(params.document as string)
    case Method.write:
      return this.write(params.content as string, params.output as string)
  }

  return Promise.resolve(undefined)
}
