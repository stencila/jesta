import * as schema from '@stencila/schema'
import { isEntity, JsonSchema, jsonSchemas } from '@stencila/schema'
import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import { DataValidationCxt } from 'ajv/dist/types'
import parseAuthor from 'parse-author'
import { parseFullName } from 'parse-full-name'
import { Jesta } from '.'
import { MethodSchema } from './types'

export const methodSchema: MethodSchema = {
  title: 'validate',
  description: 'Validate a node against the Stencila Schema.',
  required: ['node'],
  properties: {
    node: {
      description: 'The node to validate.',
    },
    force: {
      description:
        'Coerce the node to ensure it is valid (e.g. dropping properties)?',
      type: 'boolean',
      const: true,
    },
  },
}

let schemas: Record<string, JsonSchema>
let validators: Ajv
let coercers: Ajv

export async function validate(
  this: Jesta,
  node: schema.Node,
  force = true
): Promise<schema.Node> {
  if (schemas === undefined) {
    schemas = await jsonSchemas()
  }

  if (force && coercers === undefined) {
    coercers = addFormats(
      new Ajv({
        strict: false,
        schemas,
        coerceTypes: 'array',
      })
    )
    coercers.addKeyword({
      keyword: 'parser',
      type: 'string',
      modifying: true,
      validate: parse,
      errors: false,
    })
  } else if (validators === undefined) {
    validators = addFormats(
      new Ajv({
        strict: false,
        schemas,
      })
    )
  }

  const type = schema.nodeType(node)
  const validator = (force ? coercers : validators).getSchema(type)
  if (validator === undefined) {
    throw new Error(`No schema for node type ${type}`)
  }

  if (force) coerce(node)

  if (validator(node) !== true) {
    const message = validator.errors
      ?.map((error) => `${error.instancePath} ${error.message ?? ''}`)
      .join('; ')
    throw new Error(message)
  }

  return node
}
validate.schema = methodSchema

/**
 * Recursively walk through the node coercing it towards its schema
 *
 * This function does several things that Ajv will not
 * do for us:
 *   - rename aliases to canonical property names
 *
 *   - remove additional properties (not in schema);
 *     Ajv does this but with limitations when `anyOf` etc are used
 *     https://github.com/epoberezkin/ajv/blob/master/FAQ.md#additional-properties-inside-compound-keywords-anyof-oneof-etc
 *
 *   - coerce an object to an array of objects;
 *     Ajv does not do that https://github.com/epoberezkin/ajv/issues/992
 *
 *   - coerce an array with length > 1 to a scalar;
 *     Ajv (understandably) only does this if length == 1
 *
 *   - for required properties, use default values, or
 *     "empty" values (e.g. `[]` for arrays, `''` for strings)
 */
/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
function coerce(node: schema.Node): void {
  if (Array.isArray(node)) {
    for (const child of node) coerce(child)
  } else if (isEntity(node)) {
    const schema = schemas[node.type]
    const { properties = {}, propertyAliases = {}, required = [] } = schema

    // Coerce properties...
    for (const [key, child] of Object.entries(node)) {
      // Match key to a property name...
      let name: string | undefined
      if (properties[key] !== undefined) {
        // `key` is a canonical property name, so just use it
        name = key
      } else {
        // Does the key match a property name, or an alias, after
        // conversion to lower camel case?
        // Replace spaces, hyphens or underscores followed by lowercase
        // letter to uppercase letter
        const lcc = key.replace(
          /( |-|_)([a-z])/g,
          (_match, _separator, letter: string) => letter.toUpperCase()
        )
        name = properties[lcc] !== undefined ? lcc : propertyAliases[lcc]
        if (name !== undefined) {
          // Rename aliased property
          // @ts-ignore
          node[name] = child
          // @ts-ignore
          delete node[key]
        } else if (properties[key] === undefined) {
          // Remove additional property (no need to coerce child, so continue)
          console.warn(`Ignoring property ${node.type}.${key}`)
          // @ts-ignore
          delete node[key]
          continue
        }
      }

      const propertySchema = properties[name]
      const isArray = Array.isArray(child)
      if (
        propertySchema.type === 'array' &&
        !isArray &&
        typeof child === 'object'
      ) {
        // Coerce a single object to an array
        // Do not do this for primitives since Ajv will do that for us
        // and to keep strings as strings for possible decoding via
        // the `codec` keyword
        // @ts-ignore
        node[name] = [child]
      } else if (
        propertySchema.type !== undefined &&
        ['string', 'number', 'boolean', 'object', 'integer'].includes(
          propertySchema.type.toString()
        ) &&
        isArray
      ) {
        // Coerce an array to a scalar by taking the first element
        if (child.length > 1)
          console.warn(`Ignoring all but first item in ${node.type}.${key}`)
        // @ts-ignore
        node[name] = child[0]
      }

      coerce(child)
    }

    // Add default values for required properties that are missing
    for (const name of required) {
      if (!(name in node)) {
        const { default: def, type } = properties[name]
        const value = def ?? defaultForType(type)
        // @ts-ignore
        node[name] = value
      }
    }
  }
}
/* eslint-enable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

/**
 * Get the default value for a JSON schema type
 *
 * @param type  The JSON Schema type
 * @returns A default value for the type
 */
export function defaultForType(type: JsonSchema['type']): unknown {
  switch (type) {
    case 'null':
      return null
    case 'boolean':
      return false
    case 'number':
    case 'integer':
      return 0
    case 'string':
      return ''
    case 'array':
      return []
    case 'object':
      return {}
    default:
      // Default to empty string because most likely to be
      // able to be coerced elsewhere
      return ''
  }
}

/**
 * Parse a string value
 *
 * Used for the custom `parser` JSON Schema keyword.
 */
export function parse(
  schema: string,
  data: string,
  parentSchema?: unknown,
  dataCxt?: DataValidationCxt
): boolean {
  const parsed = (() => {
    switch (schema) {
      case 'csi':
        return parseCsi(data)
      case 'ssi':
        return parseSsi(data)
      case 'date':
        return parseDate(data)
      case 'person':
        return parsePerson(data)
    }
  })()

  if (parsed && dataCxt !== undefined) {
    const { parentData, parentDataProperty } = dataCxt
    parentData[parentDataProperty] = parsed
    return true
  } else {
    return false
  }
}

export const parseCsi = (data: string): string[] => data.split(/\s*,\s*/)

export const parseSsi = (data: string): string[] => data.split(/\s+/)

export const parseDate = (data: string): schema.Date => {
  // If the content is already valid ISO 8601 then just return it
  // as the value of the date. This avoids having to parse the date
  // and then generating a concise ISO 8601 string e.g. for 2020-09
  // This regex balances permissiveness with
  // complexity. More complex, less permissive regexes for this exist
  // (see https://github.com/hapi-server/data-specification/issues/54)
  // but are probably unnecessary for this use case.
  if (
    /^(-?(?:[1-9][0-9]*)?[0-9]{4})(-(1[0-2]|0[1-9]))?(-(3[01]|0[1-9]|[12][0-9]))?(T(2[0-3]|[01][0-9]))?(:[0-5][0-9])?(:[0-5][0-9])?(\.[0-9]+)?Z?$/.test(
      data
    )
  ) {
    return schema.date({ value: data })
  }

  // Date needs parsing
  // Add UTC to force parsing as UTC, rather than local.
  let date = new Date(data + ' UTC')
  // But if that fails, because another timezone specified then
  // just parse the raw date.
  if (isNaN(date.getTime())) date = new Date(data)
  if (isNaN(date.getTime())) {
    return schema.date({ value: '' })
  }

  // After parsing the date shorten it a much as possible
  // Assumes that it the user wanted to specify a date/time as precisely
  // being midnight UTC that they would enter it as an ISO string in the
  // first place
  let value = date.toISOString()
  if (value.endsWith('T00:00:00.000Z')) value = value.substring(0, 10)

  return schema.date({ value })
}

export const parsePerson = (data: string): schema.Person => {
  const { name = '', email, url } = parseAuthor(data)
  // These empty string defaults are necessary because @types/parse-full-name is
  // wrong in saying that undefineds are returned.
  const {
    title = '',
    first = '',
    middle = '',
    last = '',
    suffix = '',
  } = parseFullName(name)

  return schema.person({
    givenNames:
      first.length > 0
        ? [first, ...(middle.length > 0 ? [middle] : [])]
        : undefined,
    familyNames: last.length > 0 ? [last] : undefined,
    honorificPrefix: title.length > 0 ? title : undefined,
    honorificSuffix: suffix.length > 0 ? suffix : undefined,
    emails: email !== undefined ? [email] : undefined,
    url: url,
  })
}
