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
  const dir = plugins()
  if (!fs.existsSync(dir)) await promisify(fs.mkdir)(dir, { recursive: true })
  const file = path.join(dir, `${name}.json`)
  await promisify(fs.writeFile)(
    file,
    JSON.stringify(manifest, null, '  '),
    'utf8'
  )
}
