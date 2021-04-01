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
  const { name: pluginName, softwareVersion, description } = this.manifest()

  let {
    _: [method, ...args],
    ...options
  } = minimist(argv, {
    boolean: ['force', 'debug', 'interact', 'update'],
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

    case 'manifest': {
      const manifest = this.manifest(options.update ?? false)
      return console.log(JSON.stringify(manifest, null, '  '))
    }
    case 'register':
      return await this.register()
    case 'serve':
      return this.serve()

    case Method.convert: {
      const input = url(args[0])
      const output = url(args[1])

      await this.dispatch(Method.convert, {
        input,
        output,
        ...options,
      })

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
        persist(rl, pluginName, 'select')
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
    case Method.pipe:
    case Method.upcast:
    case Method.downcast:
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

      await this.dispatch(Method.export, {
        node: result,
        output,
        ...options,
        format: options.to,
      })

      return
    }

    case 'run':
    case Method.execute:
    case Method.vars:
    case Method.get:
    case Method.set:
    case Method.delete:
    case Method.funcs:
    case Method.call: {
      const document = url(args[0])
      const name = args[1]
      const value = args[2] // for set

      if (method === Method.execute && options.interact === true) {
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout,
          prompt: 'js> ',
        })
        persist(rl, pluginName, 'execute')
        rl.prompt()
        for await (const line of rl) {
          const node = codeChunk({
            programmingLanguage: 'js',
            text: line,
          })
          this.dispatch(Method.execute, {
            document,
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
        return
      }

      const node = await this.dispatch(Method.import, {
        input: document,
        ...options,
      })
      await this.dispatch(Method.execute, { document, node, ...options })

      if (method === 'run') await this.serve()
      else {
        let args_: Record<string, Node> = {}
        if (method === Method.call) {
          args_ = args.slice(2).reduce((prev, curr, index) => {
            const match = /\w+=.*/.exec(curr)
            const [name, json] = match ? match.slice(1) : [`${index}`, curr]
            const value = JSON.parse(json)
            return { ...prev, [name]: value }
          }, {})
        }

        const result = await this.dispatch(method, {
          document,
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
${pluginName} ${softwareVersion}: ${description}

Usage:
${pluginName} <command>

Primary commands (required for plugin integration)

manifest                     Get ${pluginName}'s manifest
register                     Register ${pluginName}
serve                        Serve ${pluginName} over stdio

Secondary commands (mainly for plugin testing)

help                         Print this message

convert <in> <out>           Convert document <in> to <out>
validate <in> [out]          Validate document <in> (save as [out])
reshape <in> [out]           Reshape document <in> (save as [out])
enrich <in> [out]            Enrich document <in> (save as [out])

select <in> <query> [out]    Select nodes from document <in> (save as [out])

compile <in> [out]           Compile document <in> (save as [out]) 
build <in> [out]             Build document <in> (save as [out])
execute <in> [out]           Execute document <in> (save as [out])
clean <in> [out]             Clean document <in> (save as [out])

vars <in>                    List variables in document <in>
get <in> <name>              Get a variable from document <in>
set <in> <name> <value>      Set a variable in document <in>
delete <in> <name>           Delete a variable from document <in>

funcs <in>                   List functions in document <in>
call <in> [func] [name=val]  Call document <in> (or a function within it)

run <in>                     Run document <in> (execute and serve)

Notes:

- use the --debug option for debug level logging and error stack traces

- \`in\` and \`out\` are file paths or URLs (e.g. http://..., file://...);
  but only some URL protocols are supported by the plugin (see manifest)

- commands with an \`in\` or \`out\` argument support the \`--format\` option

- commands with both \`in\` and \`out\` arguments support \`--from\` and
  \`--to\` options for the respective formats

- \`select\` supports the \`--lang\` option for the query language

- \`validate\`, \`compile\`, \`build\` and \`execute\` support the \`--force\` option

- \`call\` accepts \`name=val\` pairs for string parameters and \`name:=json\` for
  other parameters

- some methods can be piped together, e.g. \`clean+compile+build+execute\`

For a more advanced command line interface install ${pluginName} as a Stencila plugin
and use it from there:

  stencila install ${pluginName}
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
 * Change the working directory to directory of a document.
 */
function cd(url?: string): void {
  if (url?.startsWith('file://')) process.chdir(path.dirname(url.slice(7)))
}
