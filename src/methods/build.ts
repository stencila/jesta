import { isA, Node } from '@stencila/schema'
import { spawnSync } from 'child_process'
import fs from 'fs'
import { promisify } from 'util'
import { needed, record } from '../utilities/changes'
import * as timer from '../utilities/timer'
import { mutate } from '../utilities/walk'
import { Build, Method, Methods } from './types'

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)

/**
 * Build a stencil
 *
 * This implementation walks the stencil entity and collects the package names
 * from the `imports` property of Javascript `CodeChunk` nodes. It then
 * calls `npm install` with those packages names.
 *
 * @param entity The stencil to build.
 */
export const build: Build = async (
  methods: Methods,
  node: Node,
  force: boolean
): Promise<Node> => {
  // Build code chunks (code expressions can be ignored)
  if (isA('CodeChunk', node)) {
    // Skip if not not JavaScript code
    const { programmingLanguage } = node
    if (!['js', 'javascript'].includes(programmingLanguage ?? '')) return node

    // Skip if not needed
    if (!force && !needed(node, Method.build)) return node

    // Ensure node has been compiled
    await methods.compile(methods, node, force)

    // Start the timer
    const start = timer.start()

    // Collect a list of packages imported within the node
    const { imports = [] } = node
    const packages: string[] = []
    for (const pkg of imports) {
      const name = typeof pkg === 'string' ? pkg : pkg.name
      if (name !== undefined && !packages.includes(name)) packages.push(name)
    }

    // Read or create the stencil's package.json
    if (packages.length > 0) {
      interface PackageJson {
        dependencies: Record<string, string>
        [key: string]: unknown
      }
      let packageJson: PackageJson
      try {
        const json = await readFile('package.json', 'utf8')
        packageJson = JSON.parse(json) as PackageJson
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
          // Write out stencil's package.json with the `dependencies` property
          // updated and defaults for other properties (mainly to prevent `npm`
          // warning when they are absent)
          packageJson = {
            description: 'NPM package for this stencil',
            repository: '-',
            license: 'Apache-2.0',
            dependencies: {},
          }
          await writeFile(
            'package.json',
            JSON.stringify(packageJson, null, '  '),
            'utf8'
          )
        } else throw error
      }

      // TODO: Optimise by removing packages already in package.json
      const missing = packages.filter(
        (pkg) => packageJson.dependencies[pkg] === undefined
      )
      if (missing.length > 0) {
        // Ask `npm` to install the packages
        // TODO: Check behaviour of install, should not update the version
        // number if already there
        spawnSync('npm', ['install', '--save-exact', ...missing], {
          // TODO: Transform output from stdout and stderr into log entries
          stdio: ['ignore', 'inherit', 'inherit'],
        })
        // TODO: Consider running `npm audit fix` if necessary
      }
    }

    // Record the method
    return record(node, Method.build, timer.seconds(start))
  } else {
    // Walk over other node types
    return mutate(node, (child) => build(methods, child, force))
  }
}
