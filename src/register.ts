import fs from 'fs'
import { homedir } from 'os'
import path from 'path'
import { promisify } from 'util'
import { Manifest } from './manifest'

const writeFileAsync = promisify(fs.writeFile)
const mkdirAsync = promisify(fs.mkdir)

/**
 * Register the plugin.
 */
export const register = async (manifest: Manifest): Promise<void> => {
  const { name } = manifest
  const { env, platform } = process

  // Based on https://github.com/sindresorhus/env-paths/blob/master/index.js
  const dir = path.join(
    ...(platform === 'win32'
      ? [
          env.APPDATA || path.join(homedir(), 'AppData', 'Roaming'),
          'Stencila',
          'Config',
          'Plugins',
        ]
      : platform == 'darwin'
      ? [homedir(), 'Library', 'Preferences', 'Stencila', 'Plugins']
      : [homedir(), '.config', 'stencila', 'plugins'])
  )
  if (!fs.existsSync(dir)) await mkdirAsync(dir, { recursive: true })

  const file = path.join(dir, `${name}.json`)

  await writeFileAsync(file, JSON.stringify(manifest, null, '  '), 'utf8')
}
