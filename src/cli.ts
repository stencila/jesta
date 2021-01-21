import path from 'path'
import { DispatchFunction } from './dispatch'
import { ManifestFunction, system } from './manifest'
import { Method } from './methods'
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
  manifester: ManifestFunction,
  dispatcher: DispatchFunction
): void => {
  const manifest = manifester(system(), filePath)
  const {
    package: { name, version, description },
  } = manifest

  const methods = process.argv[2]?.split('+') ?? []
  const method: Method | string = methods.length > 1 ? Method.pipe : methods[0]

  const args = process.argv.slice(3)

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

      case 'manifest':
        return console.log(manifest)
      case 'register':
        return await register(manifest)
      case 'serve':
        return serve(manifest, dispatcher)

      case Method.decode: {
        const input = url(args[0])
        const from = args[1]

        const node = await dispatcher(Method.decode, { input, format: from })

        return console.log(node)
      }

      case Method.encode: {
        const node = JSON.parse(await stdin()) as Node
        const output = url(args[0])
        const to = args[1]

        const content = await dispatcher(Method.encode, {
          node,
          output,
          format: to,
        })

        return console.log(content)
      }

      case 'convert': {
        const input = url(args[0])
        const output = url(args[1])
        const from = args[2]
        const to = args[3]

        const node = await dispatcher(Method.decode, { input, format: from })
        await dispatcher(Method.encode, { node, output, format: to })

        return
      }

      case Method.select: {
        const input = url(required(0, 'in'))
        const query = required(1, 'query')
        const lang = required(2, 'lang')
        const output = url(optional(3))

        const node = await dispatcher(Method.decode, { input })
        const selected = await dispatcher(Method.select, { node, query, lang })
        if (output !== undefined)
          await dispatcher(Method.encode, { node: selected, output })
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
        const from = optional(2)
        const to = optional(3) ?? from

        cd(input)

        const node = await dispatcher(Method.decode, { input, format: from })
        const result = await dispatcher(method, { node, methods })
        await dispatcher(Method.encode, { node: result, output, format: to })

        return
      }

      case 'run':
      case Method.vars:
      case Method.get:
      case Method.set: {
        const input = url(required(0, 'in'))
        const name = args[1]
        const value = args[2]

        const node = await dispatcher(Method.decode, { input })
        await dispatcher(Method.execute, { node })

        if (method === 'run') serve(manifest, dispatcher)
        else {
          const result = await dispatcher(method, { name, value })
          console.log(result)
        }

        return
      }

      case 'help':
      case undefined:
        return console.log(
          `
${name} ${version}: ${description}

Usage:
  ${name} <command>

Primary commands (required for plugin integration)

  register                            Register ${name}
  serve                               Serve ${name} over stdin/stdout

Secondary commands (for testing plugin methods)

  decode <in>                         Decode a stencil from <in> to stdout
  encode <out>                        Encode a stencil from stdin to <out>
  convert <in> <out>                  Convert stencil <in> to <out>

  validate <in> [out]                 Validate stencil <in> (save as [out])
  reshape <in> [out]                  Reshape stencil <in> (save as [out])
  enrich <in> [out]                   Enrich stencil <in> (save as [out])

  select <in> <query> <lang> [out]    Select nodes from stencil <in> (save as [out])

  compile <in> [out]                  Compile stencil <in> (save as [out]) 
  build <in> [out]                    Build stencil <in> (save as [out])
  clean <in> [out]                    Clean stencil <in> (save as [out])
  execute <in> [out]                  Execute stencil <in> (save as [out])

  vars <in>                           List variables in executed stencil <in>
  get <in> <name>                     Get a variable from executed stencil <in>
  set <in> <name> <value>             Set a variable in executed stencil <in>

  run <in>                            Run stencil <in>


Other

  manifest                            Display ${name}'s manifest
  help                                Prints this message

Notes:

  - check the plugin's \`manifest\` for it's capabilities
  - \`in\` and \`out\` are file paths or URLs (e.g. http://..., file://...);
    but only some URL protocols are supported by the plugin (see manifest)
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
    console.error(error)
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
