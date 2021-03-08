import fs from 'fs'
import path from 'path'

import { Jesta } from '.'
import { Manifest, Method } from './types'

/**
 * Get the manifest for this plugin.
 *
 * This function reads in the plugin's `codemeta.json` file and
 * populates the `featureList` using the `schema` property of each
 * method. This approach allows plugin developers to easily extend
 * Jesta by writing their own `codemeta.json` file and method schemas.
 *
 * @param this The plugin instance.
 * @param update Should the `codemeta.json` file be updated?
 */
export function manifest(this: Jesta, update = false): Manifest {
  const file = path.join(__dirname, '..', 'codemeta.json')

  // Read the existing manifest
  const json = fs.readFileSync(file, 'utf8')
  const manifest = JSON.parse(json) as Manifest

  // Populate `featureList` with schemas defined in the code
  manifest.featureList = []
  for (const method of Object.keys(Method)) {
    // @ts-expect-error because indexing `Jesta`
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { schema } = this[method]
    if (schema !== undefined) {
      manifest.featureList.push(schema)
    }
  }

  // Write back the manifest
  if (update) fs.writeFileSync(file, JSON.stringify(manifest, null, '  '))

  return manifest
}
