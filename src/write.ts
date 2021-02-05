import fs from 'fs'
import { promisify } from 'util'
import { CapabilityError } from './util/errors'

const writeFileAsync = promisify(fs.writeFile)

export async function write(content: string, url: string): Promise<void> {
  const match = /^([a-z]{2,6}):\/\/(\S+)/.exec(url)
  if (match) {
    const protocol = match[1]
    switch (protocol) {
      case 'file':
        return writeFile(content, match[2])
      default:
        throw new CapabilityError(
          `Incapable of write over protocol "${protocol}"`
        )
    }
  }
}

export async function writeFile(content: string, path: string): Promise<void> {
  return writeFileAsync(path, content)
}
