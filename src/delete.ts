import { Jesta } from '.'
import { session } from './util/session'

// eslint-disable-next-line @typescript-eslint/require-await
export async function delete_(
  this: Jesta,
  stencil: string,
  name: string
): Promise<undefined> {
  delete session(stencil).context[name]
  return undefined
}
