import { isA, Node } from '@stencila/schema'
import { spawnSync } from 'child_process'
import fs from 'fs'
import { promisify } from 'util'
import { Jesta } from '.'
import { Method } from './types'
import { needed, record } from './util/changes'
import * as timer from './util/timer'
import { mutate } from './util/walk'

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)

/**
 * Build a document
 *
 * This implementation walks the document and collects NPM package names
 * from the `imports` property of Javascript `CodeChunk` nodes. It then
 * calls `npm install` with the names of the packages missing from `package.json`.
 * If there is no `package.json` file then will create one.
 *
 * @param entity The document to build.
 */
export async function build(
  this: Jesta,
  node: Node,
  force: boolean
): Promise<Node> {
  // Build code chunks (code expressions can be ignored)
  if (isA('CodeChunk', node)) {
    // Skip if not not JavaScript code
    const { programmingLanguage } = node
    if (!['js', 'javascript'].includes(programmingLanguage ?? '')) return node

    // Skip if not needed
    if (!force && !needed(node, Method.build)) return node

    // Ensure node has been compiled
    await this.compile(node, force)

    // Start the timer
    const start = timer.start()

    // Collect a list of packages imported within the node
    const { imports = [] } = node
    const packages: string[] = []
    for (const pkg of imports) {
      const name = typeof pkg === 'string' ? pkg : pkg.name
      if (name !== undefined && !packages.includes(name)) packages.push(name)
    }

    // Read or create the document's package.json
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
          // Write out document's package.json with the `dependencies` property
          // updated and defaults for other properties (mainly to prevent `npm`
          // warning when they are absent)
          packageJson = {
            description: 'NPM package for this document',
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

      // Only install packages that are not yet in package.json
      const missing = packages.filter(
        (pkg) => packageJson.dependencies[pkg] === undefined
      )
      if (missing.length > 0) {
        // Ask `npm` to install the packages
        spawnSync('npm', ['install', '--save-exact', ...missing], {
          // TODO: Transform output from stdout and stderr into log entries
          stdio: ['ignore', 'inherit', 'inherit'],
        })
      }
    }

    // Record the method
    return record(node, Method.build, timer.seconds(start))
  } else {
    // Walk over other node types
    return mutate(node, (child) => this.build(child, force))
  }
}
