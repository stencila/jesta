import { Jesta } from '.'
import { session } from './util/session'

// eslint-disable-next-line @typescript-eslint/require-await
export async function delete_(
  this: Jesta,
  document: string,
  name: string
): Promise<undefined> {
  delete session(document).context[name]
  return undefined
}
