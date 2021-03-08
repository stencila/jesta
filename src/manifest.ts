import fs from 'fs'
import path from 'path'

import { Jesta } from '.'
import { Manifest, Method } from './types'

export function manifest(this: Jesta): Manifest {
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
  fs.writeFileSync(file, JSON.stringify(manifest, null, '  '))

  return manifest
}
