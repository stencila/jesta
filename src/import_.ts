import { Node } from '@stencila/schema'
import { Jesta } from '.'

export async function import_(
  this: Jesta,
  url: string,
  format?: string,
  force?: boolean
): Promise<Node> {
  const decoded = await this.decode(url, format, force)
  const validated = await this.validate(decoded, force)
  return this.reshape(validated, force)
}
