const fs = require('fs')
const path = require('path')
const { plugins } = require('./dirs')

/**
 * Persist the history of a `readline` interface
 *
 * Based on https://github.com/Centiq/historic-readline but with an API
 * that is easier to integrate with TypeScript.
 *
 * @param {readline.Interface} rl The `readline` interface
 * @param {string} plugin The name of the plugin that the history is for
 * @param {*} command The name of the plugin command that the history is for
 */
exports.persist = function (rl, plugin, command) {
  const file = path.join(plugins(), plugin, `${command}-history.txt`)
  const history = fs.existsSync(file)
    ? fs
        .readFileSync(file, 'utf8')
        .toString()
        .split('\n')
        .slice(0, -1)
        .reverse()
        .slice(0, 1000)
    : []

  rl.history = [...(rl.history || []), ...history]

  var oldAddHistory = rl._addHistory
  rl._addHistory = function () {
    var last = rl.history[0]
    var line = oldAddHistory.call(rl)
    if (line.length > 0 && line != last) {
      fs.appendFileSync(file, line + '\n')
    }
    return line
  }
}
