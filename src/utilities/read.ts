import fs from 'fs'
import https from 'https'
import { promisify } from 'util'
import { CapabilityError } from './errors'

const readFileAsync = promisify(fs.readFile)

export const read = async (input: string): Promise<string> => {
  const match = /^([a-z]{2,6}):\/\/(\S+)/.exec(input)
  if (match) {
    const protocol = match[1]
    switch (protocol) {
      case 'file':
        return readFile(match[2])
      case 'http':
      case 'https':
        return readHttp(input)
      default:
        throw new CapabilityError(
          `Incapable of read over protocol "${protocol}"`
        )
    }
  }
  return input
}

export const readFile = async (path: string): Promise<string> => {
  return readFileAsync(path, 'utf8')
}

export const readHttp = async (input: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    https
      .get(input, (response) => {
        if (response.statusCode !== 200)
          reject(
            new Error(
              `Server responded with status code ${response.statusCode}`
            )
          )
        let data = ''
        response.on('data', (chunk) => (data += chunk))
        response.on('end', () => resolve(data))
      })
      .on('error', (error) => reject(error))
  })
}
