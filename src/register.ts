import fs from 'fs'
import path from 'path'
import { promisify } from 'util'
import { Jesta } from '.'
import { plugin } from './util/dirs'

/**
 * Register the plugin.
 */
export async function register(this: Jesta): Promise<void> {
  const manifest = this.manifest()
  const { name } = manifest

  const file = path.join(plugin(name, true), `codemeta.json`)
  await promisify(fs.writeFile)(
    file,
    JSON.stringify(manifest, null, '  '),
    'utf8'
  )
}
