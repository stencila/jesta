/**
 * A utility module for HTTP requests
 *
 * Uses `got` to enable RFC 7234 compliant HTTP caching
 *
 * @module util/http
 */

import { getLogger } from '@stencila/logga'
import fs from 'fs'
import got, { Options, Response } from 'got'
import stream from 'stream'
import util from 'util'
import { cache } from './cache'

const pipeline = util.promisify(stream.pipeline)

const log = getLogger('jesta:get')

/**
 * A `got` instance with default options for HTTP requests.
 *
 * User agent is set, and includes a `mailto`, for politeness:
 * https://github.com/CrossRef/rest-api-doc#good-manners--more-reliable-service
 */
export const client = got.extend({
  cache,
  retry: {
    limit: 5,
  },
  headers: {
    'user-agent':
      'Stencila (https://github.com/stencila/jesta; mailto:hello@stenci.la)',
    'accept-encoding': 'gzip, deflate',
  },
})

/**
 * Get content from a URL
 *
 * @param url The URL to get
 * @param options Options to pass to `got`
 */
export async function get(
  url: string,
  options: Options = {}
): Promise<Response<string>> {
  try {
    return (await client.get(url, options)) as Response<string>
  } catch (error) {
    const { message, response } = error as {
      message: string
      response: Response<string>
    }
    const body = response?.body ?? ''
    log.warn(`Unable to get ${url}: ${message}: ${body.slice(0, 500)}`)
    return response
  }
}

/**
 * Download a file
 *
 * @param from The URL to download from
 * @param to The file path to download to
 */
export async function download(from: string, to: string): Promise<void> {
  return pipeline(client.stream(from), fs.createWriteStream(to))
}
