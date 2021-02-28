import fs from 'fs'
import path from 'path'
import { promisify } from 'util'
import { Jesta } from '.'
import { plugins } from './util/dirs'

/**
 * Register the plugin.
 */
export async function register(this: Jesta): Promise<void> {
  const manifest = this.manifest()
  const {
    package: { name },
  } = manifest

  const file = path.join(plugins(), `${name}.json`)
  await promisify(fs.writeFile)(
    file,
    JSON.stringify(manifest, null, '  '),
    'utf8'
  )
}
