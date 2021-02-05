import fs from 'fs'
import got from 'got'
import { promisify } from 'util'
import { cache } from './util/cache'
import { CapabilityError } from './util/errors'

export async function read(
  url: string,
  format?: string,
  force = false
): Promise<[string, string]> {
  const match = /^([a-z]{2,6}):\/\//.exec(url)
  if (match) {
    const protocol = match[1]
    switch (protocol) {
      case 'string':
        return [url.slice(9), '']
      case 'file':
        return readFile(url.slice(7), format)
      case 'http':
      case 'https':
        return readHttp(url, format, force)
      default:
        throw new CapabilityError(
          `Incapable of read over protocol "${protocol}"`
        )
    }
  }
  return [url, '']
}

/**
 * Read content from standard input
 */
export async function readStdin(): Promise<string> {
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
 * @param path The path to the file to read
 * @param format The format of the content (extension or media type).
 *               Guessed from either the extension or content if not supplied.
 * @returns A tuple of the content and media type
 */
export async function readFile(
  path: string,
  format?: string
): Promise<[string, string]> {
  const content = await promisify(fs.readFile)(path, 'utf8')
  // TODO: guess the media type
  const mediaType = format ?? 'application/json'
  return [content, mediaType]
}

/**
 * Read content from a HTTP/S URL
 *
 * @param url The URL to fetch
 * @param format The format of the content (extension or media type).
 *               Guessed from either the extension or content if not supplied.
 * @returns A tuple of the content and media type
 */
export async function readHttp(
  url: string,
  format?: string,
  force = false
): Promise<[string, string]> {
  const response = await got(url, {
    cache: force ? undefined : cache,
  })
  const content = response.body
  // TODO: guess the media type
  const mediaType = format ?? ''
  return [content, mediaType]
}
