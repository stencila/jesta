import fs from 'fs'
import { promisify } from 'util'
import { CapabilityError } from './util/errors'

/**
 * Write content to a URL.
 *
 * @param content The content to write
 * @param url The url to write to
 */
export async function write(content: string, url: string): Promise<void> {
  const match = /^([a-z]{2,6}):\/\//.exec(url)
  if (match) {
    const protocol = match[1]
    switch (protocol) {
      case 'stdio':
      case 'stdout':
        return writeStdio(content)
      case 'file':
        return writeFile(content, url.slice(7))
      default:
        throw new CapabilityError(`write over protocol "${protocol}"`)
    }
  }
  return writeFile(content, url)
}

/**
 * Write content to standard output
 *
 * @param content The content to write
 */
export function writeStdio(content: string): Promise<void> {
  process.stdout.write(content)
  return Promise.resolve()
}

/**
 * Write content to the local file system
 *
 * @param content The content to write
 * @param path The path of the file to write
 */
export async function writeFile(content: string, path: string): Promise<void> {
  return promisify(fs.writeFile)(path, content)
}
