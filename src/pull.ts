import fs from 'fs'
import { Jesta } from '.'
import { MethodSchema } from './types'
import { CapabilityError } from './util/errors'
import { download } from './util/http'

export const schema: MethodSchema = {
  title: 'pull',
  description: 'Pull file/s from a URL to the file system',
  required: ['input', 'output'],
  properties: {
    input: {
      description: 'The URL to fetch.',
      type: 'string',
      pattern: '^(https?|file|stdio|stdin|string)://.*',
    },
    output: {
      description: 'The file path to write to',
      type: 'string',
    },
  },
}

/**
 * Pull file/s from a URL to the file system
 *
 * For `http/s` URLs this is optimised to stream content directly
 * to the file system. For `file` URLs it is optimised to simply
 * copy the file. For all other URL types, falls back to combining
 * `read` and `write`.
 *
 * @param input The URL to fetch
 * @param output The file path to write to
 * @returns The file that was created (or written over)
 */
export async function pull(
  this: Jesta,
  input: string,
  output: string
): Promise<string> {
  if (output.startsWith('file://')) {
    output = output.slice(7)
  }

  const match = /^([a-z]{2,6}):\/\//.exec(input)
  if (match) {
    const protocol = match[1]
    switch (protocol) {
      case 'http':
      case 'https': {
        await download(input, output)
        return output
      }
      case 'file': {
        await fs.promises.copyFile(input.slice(7), output)
        return output
      }
      default: {
        const [content] = await this.read(input)
        return this.write(content, output)
      }
    }
  }
  throw new CapabilityError(`pull from URL "${input.slice(0, 500)}"`)
}
pull.schema = schema
