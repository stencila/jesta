import { CodeChunk, codeChunk, Node } from '@stencila/schema'
import minimist from 'minimist'
import path from 'path'
import readline from 'readline'
import { Jesta } from '.'
import { Method } from './types'
import { persist } from './util/readline'

/**
 * Expose a command line interface for the plugin.
 *
 * This function is a simple wrapper around the `run` function that
 * passes it the args vector and exits on error. It is thus difficult
 * to test.
 */
// istanbul ignore next
export function cli(this: Jesta): void {
  run
    .bind(this)(process.argv.slice(2))
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(
        error instanceof Error && !process.argv.includes('--debug')
          ? error.message
          : error
      )
      process.exit(1)
    })
}

/**
 * Run a command.
 *
 * This function is separate from the `cli` function to facilitate testing
 *
 * @param plugin The plugin to run the command on (Jesta or a derived plugin)
 * @param argv The vector of string arguments
 */
export async function run(this: Jesta, argv: string[]): Promise<void> {
  const {
    package: { name, version, description },
  } = this.manifest()

  let {
    _: [method, ...args],
    ...options
  } = minimist(argv, {
    boolean: ['force', 'debug', 'interact'],
  })

  let calls: string[] = []
  if (method?.includes('+')) {
    calls = method.split('+')
    method = Method.pipe
  }

  switch (method) {
    // Methods are arranged in groups below according to the
    // arguments they require

    // Note: ...options should be sent to all `dispatcher` calls

    // Some of the assignments below from options are type unsafe
    // but we allow these as the dispatch function handles type checking
    /* eslint-disable @typescript-eslint/no-unsafe-assignment */

    case 'manifest':
      return console.log(this.manifest())
    case 'register':
      return await this.register()
    case 'serve':
      return this.serve()

    case 'convert': {
      const input = url(args[0])
      const outputs = args.slice(1).map(url)

      const node = await this.dispatch(Method.import, {
        input,
        ...options,
        format: options.from,
      })
      for (const output of outputs) {
        await this.dispatch(Method.export, {
          node,
          output,
          ...options,
          format: options.to,
        })
      }

      return
    }

    case Method.select: {
      const input = url(args[0])
      const query = args[1]
      const output = url(args[2])

      const node = await this.dispatch(Method.import, {
        input,
        ...options,
        format: options.from,
      })

      const select = async (query: string, output?: string): Promise<void> => {
        const selected = await this.dispatch(Method.select, {
          node,
          query,
          ...options,
        })
        if (selected !== undefined && output !== undefined)
          await this.dispatch(Method.export, {
            node: selected,
            output,
            ...options,
            format: options.to,
          })
        else console.log(selected)
      }

      if (options.interact === true) {
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout,
          prompt: '>> ',
        })
        persist(rl, name, 'select')
        rl.prompt()
        for await (const line of rl) {
          select(line, output)
            .then(() => rl.prompt())
            .catch(console.error)
        }
      } else {
        await select(query, output)
      }

      return
    }

    case Method.build:
    case Method.clean:
    case Method.compile:
    case Method.enrich:
    case Method.execute:
    case Method.pipe:
    case Method.reshape:
    case Method.validate: {
      const input = url(args[0])
      const output = url(args[1] ?? input)

      cd(input)

      const node = await this.dispatch(Method.import, {
        input,
        ...options,
        format: options.from,
      })
      const result = await this.dispatch(method, { node, ...options, calls })

      if (options.interact === true && method === Method.execute) {
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout,
          prompt: 'js> ',
        })
        persist(rl, name, 'execute')
        rl.prompt()
        for await (const line of rl) {
          const node = codeChunk({
            programmingLanguage: 'js',
            text: line,
          })
          this.dispatch(method, {
            node,
            ...options,
          })
            .then((node) => {
              const { outputs, errors } = node as CodeChunk
              if (outputs) {
                for (const output of outputs) console.log(output)
              }
              if (errors) {
                for (const error of errors) {
                  const { errorType, errorMessage } = error
                  console.error(`${errorType ?? 'Error'}: ${errorMessage}`)
                }
              }
              rl.prompt()
            })
            .catch(console.error)
        }
      }

      await this.dispatch(Method.export, {
        node: result,
        output,
        ...options,
        format: options.to,
      })

      return
    }

    case 'run':
    case Method.vars:
    case Method.get:
    case Method.set:
    case Method.delete:
    case Method.funcs:
    case Method.call: {
      const input = url(args[0])
      const name = args[1]
      const value = args[2] // for set

      let args_: Record<string, Node> = {}
      if (method === Method.call) {
        args_ = args.slice(2).reduce((prev, curr, index) => {
          const match = /\w+=.*/.exec(curr)
          const [name, json] = match ? match.slice(1) : [`${index}`, curr]
          const value = JSON.parse(json)
          return { ...prev, [name]: value }
        }, {})
      }

      const node = await this.dispatch(Method.import, { input, ...options })
      await this.dispatch(Method.execute, { node, ...options })

      if (method === 'run') await this.serve()
      else {
        const result = await this.dispatch(method, {
          name,
          value,
          args: args_,
          ...options,
        })
        console.log(result)
      }

      return
    }

    /* eslint-enable @typescript-eslint/no-unsafe-assignment */

    case 'help':
    case undefined:
      return console.log(
        `
${name} ${version}: ${description}

Usage:
${name} <command>

Primary commands (required for plugin integration)

register                     Register ${name}
serve                        Serve ${name} over stdin/stdout

Secondary commands (mainly for plugin testing)

help                         Print this message
manifest                     Display ${name}'s manifest

convert <in> <out>           Convert stencil <in> to <out>
validate <in> [out]          Validate stencil <in> (save as [out])
reshape <in> [out]           Reshape stencil <in> (save as [out])
enrich <in> [out]            Enrich stencil <in> (save as [out])

select <in> <query> [out]    Select nodes from stencil <in> (save as [out])

compile <in> [out]           Compile stencil <in> (save as [out]) 
build <in> [out]             Build stencil <in> (save as [out])
execute <in> [out]           Execute stencil <in> (save as [out])
clean <in> [out]             Clean stencil <in> (save as [out])

vars <in>                    List variables in stencil <in>
get <in> <name>              Get a variable from stencil <in>
set <in> <name> <value>      Set a variable in stencil <in>
delete <in> <name>           Delete a variable from stencil <in>

funcs <in>                   List functions in stencila <in>
call <in> <name> [arg=val]   Call a function in stencil <in>

run <in>                     Run (execute and serve) stencil <in>

Notes:

- use the --debug option for debug level logging and error stack traces

- \`in\` and \`out\` are file paths or URLs (e.g. http://..., file://...);
  but only some URL protocols are supported by the plugin (see manifest)

- commands with an \`in\` or \`out\` argument support the \`--format\` option

- commands with both \`in\` and \`out\` arguments support \`--from\` and
  \`--to\` options for the respective formats

- \`select\` supports the \`--lang\` option for the query language

- \`validate\`, \`compile\`, \`build\` and \`execute\` support the \`--force\` option

- some methods can be piped together, e.g. \`clean+compile+build+execute\`

For a more advanced command line interface install ${name} as a Stencila plugin
and use it from there:

  stencila install ${name}
      `.trim()
      )

    default:
      console.error(`Unknown command "${method}"`)
  }
}

/**
 * Coerce a value to a URL.
 *
 * If the value is not yet a URL then assumes that it is
 * file system path and returns a resolved file:// URL.
 *
 * @param value The value to coerce
 */
function url(value: undefined): undefined
function url(value: string): string
function url(value: string | undefined): string | undefined
function url(value: string | undefined): string | undefined {
  if (value === undefined) return undefined
  if (value === '-') return 'stdio://'
  return /^([a-z]{2,6}):\/\//.test(value)
    ? value
    : `file://${path.resolve(value)}`
}

/**
 * Change the working directory to directory of a stencil.
 */
function cd(url?: string): void {
  if (url?.startsWith('file://')) process.chdir(path.dirname(url.slice(7)))
}
