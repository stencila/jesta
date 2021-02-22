/**
 * Utility module with functions that return the path to operating
 * system specific directories.
 *
 * Much of these implementations is based on
 * https://github.com/sindresorhus/env-paths/blob/master/index.js
 */

import os from 'os'
import path from 'path'

const homedir = os.homedir()

/**
 * Get a Stencila plugins directory.
 *
 * The `plugins` directory is used to store the manifests and other
 * data of Stencila plugins.
 */
export function plugins(): string {
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
}

/**
 * Get the Stencila cache directory.
 *
 * The `cache` directory is used to store cached content that may
 * be used across applications, plugins and machine restarts.
 */
export function cache(): string {
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
}
