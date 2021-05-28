import contentType from 'content-type'
import fs from 'fs'
import got from 'got'
import mime from 'mime'
import path from 'path'
import { promisify } from 'util'
import { MethodSchema } from './types'
import { cache } from './util/cache'
import { CapabilityError } from './util/errors'

export const schema: MethodSchema = {
  title: 'read',
  description: 'Read content from a URL.',
  required: ['input'],
  properties: {
    input: {
      description: 'The URL to read content from.',
      type: 'string',
      pattern: '^(file|https?|stdio|stdin|string)://.*',
    },
    cache: {
      description: 'Use and store cached content (for http:// URLs only).',
      type: 'boolean',
    },
  },
}

/**
 * Read content from a URL.
 *
 * For HTTP/S URLs this function complies with [RFC 7234](http://httpwg.org/specs/rfc7234.html)
 * for caching of requests. Use `force` to ignore any cached content that may
 * exist on the machine for the URL.
 *
 * @param input The URL to read.
 * @param cache Should any cached content be ignored? For remote URLs only.
 * @returns The content that was read.
 */
export async function read(
  input: string,
  cache = true
): Promise<[string, string | undefined]> {
  const match = /^([a-z]{2,6}):\/\//.exec(input)
  if (match) {
    const protocol = match[1]
    switch (protocol) {
      case 'string':
        return [input.slice(9), undefined]
      case 'stdio':
      case 'stdin':
        return [await readStdio(), undefined]
      case 'file':
        return readFile(input.slice(7))
      case 'http':
      case 'https':
        return readHttp(input, cache)
      default:
        throw new CapabilityError(`read over protocol "${protocol}"`)
    }
  }
  throw new CapabilityError(`read from URL "${input.slice(0, 500)}"`)
}
read.schema = schema

/**
 * Read content from standard input
 *
 * @returns The content
 */
export async function readStdio(): Promise<string> {
  const stream = process.stdin
  stream.setEncoding('utf8')
  return new Promise((resolve, reject) => {
    let data = ''
    stream.on('data', (chunk) => (data += chunk))
    stream.on('end', () => resolve(data))
    stream.on('error', (error) => reject(error))
  })
}

/**
 * Read content from the local file system
 *
 * @param filePath The path to the file to read
 * @returns A tuple of the content and its format
 */
export async function readFile(
  filePath: string
): Promise<[string, string | undefined]> {
  const content = await promisify(fs.readFile)(filePath, 'utf8')
  const { ext } = path.parse(filePath)
  const format = ext !== '' ? ext.slice(1) : undefined
  return [content, format]
}

/**
 * Read content from a HTTP/S URL
 *
 * The format is determined from the `Content-Type` header if present,
 * guessed from the URL's path segment if not.
 *
 * @param url The URL to fetch
 * @param caching Should a cache be used to retrieve / store content.
 * @returns A tuple of the content and its format
 */
export async function readHttp(
  url: string,
  caching = true
): Promise<[string, string | undefined]> {
  const response = await got(url, {
    cache: caching ? cache : undefined,
  })
  const content = response.body

  let mediaType
  try {
    ;({ type: mediaType } = contentType.parse(response))
  } catch (error) {}

  let format
  if (mediaType !== undefined) {
    format = mime.getExtension(mediaType) ?? undefined
  } else {
    const { pathname } = new URL(url)
    const ext = path.extname(pathname)
    format = ext !== '' ? ext.slice(1) : undefined
  }

  return [content, format]
}
