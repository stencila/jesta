import { Node } from '@stencila/schema'
import { Jesta } from '.'

export async function decode(
  this: Jesta,
  url: string,
  format?: string,
  force?: boolean
): Promise<Node> {
  const [content, mediaType] = await this.read(url, format, force)

  if (mediaType.startsWith('application/json')) {
    return JSON.parse(content) as Node
  }

  throw Error(`Incapable of decoding from format "${mediaType}"`)
}
