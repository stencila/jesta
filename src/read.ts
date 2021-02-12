import contentType from 'content-type'
import fs from 'fs'
import got from 'got'
import mime from 'mime'
import { promisify } from 'util'
import { cache } from './util/cache'
import { CapabilityError } from './util/errors'

/**
 * Read content from a URL.
 *
 * Returns a tuple with the content and the [Media Type](https://www.iana.org/assignments/media-types/media-types.xhtml)
 * of the content.
 *
 * Use `format` (either a filename extension or Media Type) to force
 * a particular Media Type to be returned. Otherwise the Media Type will be inferred
 * from the `Content-Type` header (for HTTP requests) or from the extension
 * name (if any) of the URL. If the Media Type can not be guessed, will return
 * an empty string.
 *
 * For HTTP/S URLs this function complies with [RFC 7234](http://httpwg.org/specs/rfc7234.html)
 * for caching of requests. Use `force` to ignore any cached content that may
 * exist on the machine for the URL.
 *
 * @param url The URL to read.
 * @param format The format to assume for the read content.
 * @param force Should any cached content be ignored? For remote URLs only.
 * @returns A tuple of [content, media type]
 */
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
        return [url.slice(9), guessMediaType(format)]
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
  return [url, guessMediaType(format)]
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
  const mediaType = guessMediaType(format, path)
  return [content, mediaType]
}

/**
 * Read content from a HTTP/S URL
 *
 * The
 *
 * @param url The URL to fetch
 * @param format The format of the content (extension or media type).
 *               From the `Content-Type` header if present, guessed from either the extension if not.
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

  let mediaType
  if (format === undefined) {
    try {
      ;({ type: mediaType } = contentType.parse(response))
    } catch (error) {}
  }
  if (mediaType === undefined) {
    const { pathname } = new URL(url)
    mediaType = guessMediaType(format, pathname)
  }

  return [content, mediaType]
}

/**
 * Guess the IANA Media Type from a supplied format string or file path.
 *
 * If the supplied format string looks like a Media Type then that will be
 * returned. Otherwise will attempt to be guessed from the extension name
 * of the supplied path.
 */
function guessMediaType(format?: string, path?: string): string {
  if (format?.includes('/')) return format
  if (format !== undefined) return mime.getType(format) ?? ''
  if (path !== undefined) return mime.getType(path) ?? ''
  return ''
}
