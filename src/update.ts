import fs from 'fs'
import { Jesta } from '.'
import { Manifest, Method } from './types'

/**
 * Update the manifest for a plugin using declared schema of methods
 *
 * Used for updating a `codemeta.json` file during a build.
 * This function updates  the `featureList` of the supplied `Manifest`
 * using the `schema` property of each method. This approach allows
 * plugin developers to easily extend Jesta by writing their own
 * `codemeta.json` file and method schemas.
 *
 * @param this The plugin instance.
 */
export function update(this: Jesta, file?: string): Manifest {
  this.manifest.featureList = []
  for (const method of Object.keys(Method)) {
    // @ts-expect-error because indexing `Jesta`
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { schema } = this[method]
    if (schema !== undefined) {
      this.manifest.featureList.push(schema)
    }
  }

  // Provide the option to overwrite the file. Using > piping will not work because the
  // shell removes the file before it can be read for updating
  if (file !== undefined) {
    fs.writeFileSync(file, JSON.stringify(this.manifest, null, '  '))
  }

  return this.manifest
}
