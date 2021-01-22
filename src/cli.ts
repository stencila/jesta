import { Node } from '@stencila/schema'
import minimist from 'minimist'
import path from 'path'
import { dispatch } from './dispatch'
import { Manifest } from './manifest'
import { Dispatch, Method, Methods } from './methods/types'
import { register } from './register'
import { serve } from './serve'

/**
 * Expose a command line interface for the plugin.
 *
 * This is the entry point function for the plugin.
 * It takes two functions as arguments, `manifest` and `dispatch`.
 *
 * After defining your plugin's `manifest` and `dispatch` functions
 * you will normally place the following line at the end of your
 * plugin's `index.ts` (or `index.js`) file:
 *
 * ```ts
 * if (require.main === module) cli(manifest, dispatch)
 * ```
 */
export const cli = (
  filePath: string,
  manifest: Manifest,
  dispatcher: Methods | Dispatch
): void => {
  const {
    package: { name, version, description },
  } = manifest

  const call =
    typeof dispatcher === 'function'
      ? dispatcher
      : (method: string, params: Record<string, Node | undefined>) =>
          dispatch(method, params, dispatcher)

  const { name: fileName, ext } = path.parse(filePath)
  const [stdioCommand, ...stdioArgs] = `${
    ext === '.js' ? 'node' : 'npx ts-node'
  } ${fileName === 'index' ? path.dirname(filePath) : filePath}`.split(/\s+/)
  for (const address of manifest.addresses) {
    if (address.transport === 'stdio' && address.command === '') {
      address.command = stdioCommand
      address.args.unshift(...stdioArgs)
    }
  }

  let {
    _: [method, ...args],
    ...options
  } = minimist(process.argv.slice(2), {
    boolean: 'force',
  })

  let calls: string[]
  if (method?.includes('+')) {
    calls = method.split('+')
    method = Method.pipe
  }

  function required(index: number, name: string): string {
    const value = args[index]
    if (value !== undefined) return value
    throw new Error(`Argument <${name}> is required`)
  }

  function optional(index: number): string | undefined {
    return args[index]
  }

  function url(value: undefined): undefined
  function url(value: string): string
  function url(value: string | undefined): string | undefined
  function url(value: string | undefined): string | undefined {
    if (value === undefined) return undefined
    return /^([a-z]{2,6}):\/\/\S+/.test(value)
      ? value
      : `file://${path.resolve(value)}`
  }

  function cd(url: string): void {
    if (url.startsWith('file://')) process.chdir(path.dirname(url.slice(7)))
  }

  // Using a nested async function like this one allows
  // (a) use of return on cases (b) keeping the `cli` function
  // sync so that eslint does not complain when it is called without awaiting.
  //
  // When outputting nodes, using `console.log` because of built-in pretty-printing
  // of objects
  async function run(): Promise<void> {
    switch (method) {
      // Methods are arranged in groups below according to the
      // arguments they require

      // Note: ...options should be sent to all `dispatcher` calls
      // (although they will often be ignored)

      // Some of the assignments below from options are type unsafe
      // but we allow these as the dispatch function handles type checking
      /* eslint-disable @typescript-eslint/no-unsafe-assignment */

      case 'manifest':
        return console.log(manifest)
      case 'register':
        return await register(manifest)
      case 'serve':
        return serve(manifest, dispatch)

      case Method.decode: {
        const input = url(required(0, 'in'))

        const node = await call(Method.decode, { input, ...options })

        return console.log(node)
      }

      case Method.encode: {
        const output = url(args[0])
        console.log('Enter a node as JSON and Ctrl+D when finished')
        const node = JSON.parse(await stdin()) as Node

        const content = await call(Method.encode, {
          node,
          output,
          ...options,
        })

        return console.log(content)
      }

      case 'convert': {
        const input = url(required(0, 'in'))
        const output = url(required(1, 'out'))

        const node = await call(Method.decode, {
          input,
          ...options,
          format: options.from,
        })
        await call(Method.encode, {
          node,
          output,
          ...options,
          format: options.to,
        })

        return
      }

      case Method.select: {
        const input = url(required(0, 'in'))
        const query = required(1, 'query')
        const output = url(optional(2))

        const node = await call(Method.decode, {
          input,
          ...options,
          format: options.from,
        })
        const selected = await call(Method.select, {
          node,
          query,
          ...options,
        })
        if (selected !== undefined && output !== undefined)
          await call(Method.encode, {
            node: selected,
            output,
            ...options,
            format: options.to,
          })
        else console.log(selected)

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
        const input = url(required(0, 'in'))
        const output = url(optional(1) ?? input)

        cd(input)

        const node = await call(Method.decode, {
          input,
          ...options,
          format: options.from,
        })
        const result = await call(method, { node, ...options, calls })
        await call(Method.encode, {
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
      case Method.set: {
        const input = url(required(0, 'in'))
        const name = args[1]
        const value = args[2]

        const node = await call(Method.decode, { input, ...options })
        await call(Method.execute, { node, ...options })

        if (method === 'run') serve(manifest, dispatch)
        else {
          const result = await call(method, { name, value, ...options })
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

Secondary commands (mainly for testing plugin)

  help                         Print this message
  manifest                     Display ${name}'s manifest

  decode <in>                  Decode a stencil from <in> to stdout
  encode <out>                 Encode a stencil from stdin to <out>
  convert <in> <out>           Convert stencil <in> to <out>

  validate <in> [out]          Validate stencil <in> (save as [out])
  reshape <in> [out]           Reshape stencil <in> (save as [out])
  enrich <in> [out]            Enrich stencil <in> (save as [out])

  select <in> <query> [out]    Select nodes from stencil <in> (save as [out])

  clean <in> [out]             Clean stencil <in> (save as [out])
  compile <in> [out]           Compile stencil <in> (save as [out]) 
  build <in> [out]             Build stencil <in> (save as [out])
  execute <in> [out]           Execute stencil <in> (save as [out])

  vars <in>                    List variables in stencil <in>
  get <in> <name>              Get a variable from stencil <in>
  set <in> <name> <value>      Set a variable in stencil <in>

  run <in>                     Run stencil <in> (execute and serve)

Notes:

  - check the plugin's \`manifest\` for it's capabilities

  - \`in\` and \`out\` are file paths or URLs (e.g. http://..., file://...);
    but only some URL protocols are supported by the plugin (see manifest)
  
  - commands with an \`in\` or \`out\` argument support the \`--format\` option

  - commands with both \`in\` and \`out\` arguments support \`--from\` and
    \`--to\` options for the respective formats

  - \`select\` supports the \`--lang\` option for the query language

  - \`validate\`, \`compile\`, and \`build\` support the \`--force\` option

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

  run().catch((error) => {
    console.error(error instanceof Error ? error.message : error)
    process.exit(1)
  })
}

const stdin = async (): Promise<string> => {
  process.stdin.setEncoding('utf8')
  let data = ''
  for await (const chunk of process.stdin) {
    data += chunk
  }
  return data
}
