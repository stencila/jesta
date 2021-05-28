import fs from 'fs'
import { promisify } from 'util'
import { MethodSchema } from './types'
import { CapabilityError } from './util/errors'

export const schema: MethodSchema = {
  title: 'write',
  description: 'Write content to a URL.',
  required: ['content', 'output'],
  properties: {
    content: {
      description: 'The content to write',
      type: 'string',
    },
    output: {
      description: 'The URL to write the content to.',
      type: 'string',
      pattern: '^(file|stdio|stdout|string)://.*',
    },
  },
}

/**
 * Write content to a URL.
 *
 * @param content The content to write
 * @param output The URL to write to
 * @returns The URL that was written to (including the `content` for `file://` URLs)
 */
export async function write(content: string, output: string): Promise<string> {
  const match = /^([a-z]{2,6}):\/\//.exec(output)
  if (match) {
    const protocol = match[1]
    switch (protocol) {
      case 'string':
        return writeString(content)
      case 'stdio':
      case 'stdout':
        writeStdio(content)
        break
      case 'file':
        await writeFile(content, output.slice(7))
        break
      default:
        throw new CapabilityError(`write over protocol "${protocol}"`)
    }
  } else {
    await writeFile(content, output)
  }
  return output
}
write.schema = schema

/**
 * Write content to a string URL
 *
 * @param content The content to write
 */
export function writeString(content: string): string {
  return `string://${content}`
}

/**
 * Write content to standard output
 *
 * @param content The content to write
 */
export function writeStdio(content: string): void {
  process.stdout.write(content)
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
