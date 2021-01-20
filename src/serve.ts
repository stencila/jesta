import readline from 'readline'
import { DispatchFunction } from './dispatch'

/**
 * Serve the plugin.
 */
export const serve = (dispatcher: DispatchFunction): void => {
  const reader = readline.createInterface({
    input: process.stdin,
    terminal: false,
  })
  reader.on('line', function (line) {
    // TODO parse as JSOn and dispatch
    process.stdout.write(line + '\n')
  })
}
