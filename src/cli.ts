import path from 'path'
import { DispatchFunction } from './dispatch'
import { ManifestFunction, system } from './manifest'
import { Method } from './methods/method'
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
  const { name, version, description, command } = manifest

  const methods = process.argv[2].split('+')
  const method: Method | string = methods.length > 1 ? Method.pipe : methods[0]

  const args = process.argv.slice(3)
  const options: Record<string, string> = {}

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

  function cd(url: string) {
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
        return serve(dispatcher)

      case Method.decode: {
        const input = url(args[0])
        const from = args[1]

        const node = await dispatcher(Method.decode, { input, from })

        return console.log(node)
      }

      case Method.encode: {
        const node = JSON.parse(await stdin()) as Node
        const output = url(args[0])
        const to = args[1]

        const content = await dispatcher(Method.encode, { node, output, to })

        return console.log(content)
      }

      case 'convert': {
        const input = url(args[0])
        const output = url(args[1])
        const from = args[2]
        const to = args[3]

        const node = await dispatcher(Method.decode, { input, from })
        await dispatcher(Method.encode, { node, output, to })

        return
      }

      case Method.select: {
        const input = url(required(0, 'in'))
        const query = required(1, 'query')
        const lang = required(2, 'lang')
        const output = url(optional(3))
        const { from, to } = options

        const node = await dispatcher(Method.decode, { input, from })
        const child = await dispatcher(Method.select, { node, query, lang })
        if (output) await dispatcher(Method.encode, { node: child, output })
        else console.log(node)

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

        const node = await dispatcher(Method.decode, { input, from })
        const result = await dispatcher(method, { node, methods })
        await dispatcher(Method.encode, { result, output, to })

        return
      }

      case 'run': {
        const input = url(required(0, 'in'))
        const from = args[2]

        const node = await dispatcher(Method.decode, { input, from })
        await dispatcher(Method.execute, { node })
        serve(dispatcher)

        return
      }

      case 'help':
      case undefined:
        return console.log(
          `
${name} ${version}: ${description}

Usage:
  ${command} <command>

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
  get <in> <name>                     Get a variable from a stencil
  set <in> <name>                     Set a variable in a stencil

  compile <in> [out]                  Compile stencil <in> (save as [out]) 
  build <in> [out]                    Build stencil <in> (save as [out])
  clean <in> [out]                    Clean stencil <in> (save as [out])
  execute <in> [out]                  Execute stencil <in> (save as [out])
  run <in>                            Run stencil <in>

Other

  manifest                            Display ${name}'s manifest
  help                                Prints this message

Notes:

  - check the plugin's \`manifest\` for it's capabilities
  - if the plugin does not have a particular capability it will throw
    a \`CapabilityError\` for that method
  - \`in\` and \`out\` are file paths or URLs (e.g. http://..., file://...);
    only some URL protocols are supported by \`read\` (for \`in\`) and \`write\` (for \`out\`)


For a more advanced command line inteface install ${name} as a Stencila plugin
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
