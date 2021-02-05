import { Node } from '@stencila/schema'
import { Jesta } from '.'

export async function export_(
  this: Jesta,
  node: Node,
  url: string,
  format?: string,
  force?: boolean
): Promise<void> {
  const reshaped = await this.reshape(node, force)
  const validated = await this.validate(reshaped, force)
  const encoded = await this.encode(validated, format)
  if (encoded !== undefined) return this.write(encoded, url)
}
