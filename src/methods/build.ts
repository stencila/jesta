import { Entity, isA } from '@stencila/schema'
import { spawn } from 'child_process'
import fs from 'fs'
import { promisify } from 'util'
import { record } from '../utilities/changes'
import * as timer from '../utilities/timer'
import { visit } from '../utilities/walk'
import { Method } from './method'

const readFileAsync = promisify(fs.readFile)
const writeFileAsync = promisify(fs.writeFile)

/**
 * Build a stencil
 *
 * This implementation walks the stencil entity and collects the package names
 * from the `imports` property of Javascript `CodeChunk` nodes. It then
 * calls `npm install` with those packages names.
 *
 * @param entity The stencil to build.
 */
export const build = async (entity: Entity): Promise<Entity> => {
  const start = timer.start()

  // Collect a list of packages imported within the stencil
  const packages: string[] = []
  visit(entity, (entity: Entity) => {
    if (isA('CodeChunk', entity)) {
      const { programmingLanguage, imports = [] } = entity
      if (['js', 'javascript'].includes(programmingLanguage ?? '')) {
        for (const pkg of imports) {
          const name = typeof pkg === 'string' ? pkg : pkg.name
          if (name !== undefined && !packages.includes(name))
            packages.push(name)
        }
      }
    }
  })

  // Read or create the stencil's package.json
  let pkg
  try {
    const json = await readFileAsync('package.json', 'utf8')
    pkg = JSON.parse(json)
  } catch (error) {
    if (error.code === 'ENOENT') pkg = {}
    else throw error
  }

  // Write out stencil's package.json with the `dependencies` property
  // updated and defaults for other properties (mainly to prevent `npm`
  // warning when they are absent)
  const json = JSON.stringify(
    {
      description: 'NPM package for this stencil',
      repository: '-',
      license: 'Apache-2.0',
      ...pkg,
      // TODO: Consider how to specify package semver requirements
      dependencies: packages.reduce(
        (prev, name) => ({ ...prev, [name]: '*' }),
        {}
      ),
    },
    null,
    '  '
  )
  await writeFileAsync('package.json', json, 'utf8')

  // Ask `npm` to install the packages
  await spawn('npm', ['install'], {
    // TODO: Transform output form stdout and stderr into log entries
    stdio: ['ignore', 'inherit', 'inherit'],
  })
  // TODO: Consider running `npm audit fix` if necessary

  // Record the method
  return record(entity, Method.build, timer.seconds(start))
}
