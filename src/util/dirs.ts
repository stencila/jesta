/**
 * Utility module with functions that return the path to operating
 * system specific directories.
 *
 * Whilst there are packages that provide similar functions, we
 * generally prefer to roll our own for each language to make
 * sure that there is consistency in their implementation.
 *
 * Much of these implementations is based on
 * https://github.com/sindresorhus/env-paths/blob/master/index.js
 */

import fs from 'fs'
import os from 'os'
import path from 'path'

const homedir = os.homedir()

/**
 * Get the Stencila plugins directory.
 *
 * The `plugins` directory is used to store the manifests and other
 * data of Stencila plugins.
 */
export function plugins(ensure = true): string {
  const dir = (() => {
    const { env, platform } = process
    if (platform === 'darwin')
      return path.join(homedir, 'Library', 'Preferences', 'Stencila', 'Plugins')
    if (platform === 'win32')
      return path.join(
        env.APPDATA ?? path.join(homedir, 'AppData', 'Roaming'),
        'Stencila',
        'Config',
        'Plugins'
      )
    return path.join(
      env.XDG_CONFIG_HOME ?? path.join(homedir, '.config'),
      'stencila',
      'plugins'
    )
  })()

  if (ensure && !fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

  return dir
}

/**
 * Get the Stencila cache directory.
 *
 * The `cache` directory is used to store cached content that may
 * be used across applications, plugins and machine restarts.
 */
export function cache(ensure = true): string {
  const dir = (() => {
    const { env, platform } = process
    if (platform === 'darwin')
      return path.join(homedir, 'Library', 'Caches', 'Stencila')
    if (platform === 'win32')
      return path.join(
        env.LOCALAPPDATA ?? path.join(homedir, 'AppData', 'Local'),
        'Stencila',
        'Cache'
      )
    return path.join(
      env.XDG_CACHE_HOME ?? path.join(homedir, '.cache'),
      'stencila'
    )
  })()

  if (ensure && !fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

  return dir
}
