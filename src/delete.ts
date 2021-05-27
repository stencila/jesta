import { Jesta } from '.'
import { session } from './util/session'

// eslint-disable-next-line @typescript-eslint/require-await
export async function delete_(this: Jesta, name: string): Promise<undefined> {
  delete session().context[name]
  return undefined
}
