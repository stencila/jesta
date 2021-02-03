import { Node } from '@stencila/schema'
import { Jesta } from '.'
import { context } from './util/session'

// eslint-disable-next-line @typescript-eslint/require-await
export async function delete_(this: Jesta, name: string): Promise<undefined> {
  delete context[name]
  return undefined
}
