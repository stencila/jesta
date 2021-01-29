import { homedir } from 'os'
import path from 'path'

export function plugins(): string {
  const { env, platform } = process
  // Based on https://github.com/sindresorhus/env-paths/blob/master/index.js
  return path.join(
    ...(platform === 'win32'
      ? [
          env.APPDATA ?? path.join(homedir(), 'AppData', 'Roaming'),
          'Stencila',
          'Config',
          'Plugins',
        ]
      : platform === 'darwin'
      ? [homedir(), 'Library', 'Preferences', 'Stencila', 'Plugins']
      : [homedir(), '.config', 'stencila', 'plugins'])
  )
}
