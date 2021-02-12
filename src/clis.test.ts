import fs from 'fs'
import tempy from 'tempy'
import { stdin as mockStdin } from 'mock-stdin'
import { Jesta } from '.'
import { fixture } from '../tests/helpers'
import { run } from './cli'

// An instance of jest which we can mock methods on
const jesta = new Jesta('')

// Spies for console output
const consoleLog = jest.spyOn(console, 'log').mockImplementation()
const consoleError = jest
  .spyOn(console, 'error')
  .mockImplementation((message) => {
    // To avoid silent errors, send them to info instead
    console.info(message)
  })

// Clear mocks and run the CLI
async function cli(args: string[]): Promise<void> {
  consoleLog.mockClear()
  consoleError.mockClear()

  return run.bind(jesta)(args)
}

const one = fixture('one', 'index.json')

describe('manifest', () => {
  it("outputs the plugin's manifest", async () => {
    await cli(['manifest'])
    expect(consoleLog).toHaveBeenCalledTimes(1)
    expect(consoleLog).toHaveBeenCalledWith(
      expect.objectContaining({ version: 1 })
    )
  })
})

describe('register', () => {
  it('registers the plugin', async () => {
    // Mock to avoid actual registration
    const registerMock = jest.fn(() => Promise.resolve())
    jesta.register = registerMock

    await cli(['register'])
    expect(registerMock).toHaveBeenCalledTimes(1)
    expect(consoleLog).toHaveBeenCalledTimes(0)
  })
})

describe('serve', () => {
  it('serves the plugin', async () => {
    // Mock to avoid actual blocking serve
    const serveMock = jest.fn(() => Promise.resolve())
    jesta.serve = serveMock

    await cli(['serve'])
    expect(serveMock).toHaveBeenCalledTimes(1)
    expect(consoleLog).toHaveBeenCalledTimes(0)
  })
})

describe('convert', () => {
  it('converts input to one output', async () => {
    const temp = tempy.file({ extension: 'json' })
    await cli(['convert', one, temp])
    expect(fs.existsSync(temp))
    expect(consoleLog).toHaveBeenCalledTimes(0)
  })

  it('converts input to severals output', async () => {
    const temp1 = tempy.file({ extension: 'json' })
    const temp2 = tempy.file({ extension: 'json' })
    await cli(['convert', one, temp1, temp2])
    expect(fs.existsSync(temp1))
    expect(fs.existsSync(temp2))
    expect(consoleLog).toHaveBeenCalledTimes(0)
  })

  it('works with stdin as input', async () => {
    const stdin = mockStdin()
    process.nextTick(() => {
      stdin.send('{"type": "Paragraph"}')
      stdin.end()
    })
    const temp = tempy.file({ extension: 'json' })
    await cli(['convert', '-', '--from=json', temp])

    expect(fs.existsSync(temp))
  })

  it('works with stdout as output', async () => {
    const stdoutWrite = jest.spyOn(process.stdout, 'write').mockImplementation()
    await cli(['convert', one, '-', '--to=json'])
    expect(consoleLog).toHaveBeenCalledTimes(0)
    expect(stdoutWrite).toHaveBeenCalledWith(expect.stringMatching(/^{/))
  })

  it('errors if file does not exist', async () => {
    await expect(cli(['convert', 'foo.bar', 'baz.json'])).rejects.toThrow(
      /ENOENT: no such file or directory/
    )
  })

  it('errors if extension formats are unsupported', async () => {
    await expect(cli(['convert', one, 'baz.bar'])).rejects.toThrow(
      /Incapable of encoding to format "bar"/
    )
  })

  it('requires <in> argument', async () => {
    await expect(cli(['convert'])).rejects.toThrow(
      /Parameter 'input' is required/
    )
  })
})

describe('select', () => {
  it('selects a child from a node and sends to output', async () => {
    await cli(['select', one, 'content[0]'])
    expect(consoleLog).toHaveBeenCalledTimes(1)
    expect(consoleLog).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'CodeChunk' })
    )
  })

  it('selects a child from a node and sends to file', async () => {
    const temp = tempy.file({ extension: 'json' })
    await cli(['select', one, 'content[1]', temp])
    expect(fs.existsSync(temp))
    expect(consoleLog).toHaveBeenCalledTimes(0)
  })

  it('has an interactive mode', async () => {
    const stdin = mockStdin()
    setTimeout(() => {
      stdin.send('content[0]\n')
      stdin.end()
    }, 100)
    await cli(['select', one, '--interact'])
    expect(consoleLog).toHaveBeenCalledTimes(1)
    expect(consoleLog).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'CodeChunk' })
    )
  })

  it('requires <in> argument', async () => {
    await expect(cli(['select'])).rejects.toThrow(
      /Parameter 'input' is required/
    )
  })

  it('requires <query> argument', async () => {
    await expect(cli(['select', one])).rejects.toThrow(
      /Parameter 'query' is required/
    )
  })
})

describe('execute', () => {
  it('has an interactive mode', async () => {
    const stdin = mockStdin()
    setTimeout(() => {
      stdin.send('6 * 7\n')
      stdin.end()
    }, 100)
    const temp = tempy.file({ extension: 'json' })
    await cli(['execute', one, temp, '--interact'])
    expect(consoleLog).toHaveBeenCalledTimes(1)
    expect(consoleLog).toHaveBeenCalledWith(42)
  })

  it('interactive mode prints errors to stderr', async () => {
    const stdin = mockStdin()
    setTimeout(() => {
      stdin.send('% $#\n')
      stdin.end()
    }, 100)
    const temp = tempy.file({ extension: 'json' })
    await cli(['execute', one, temp, '--interact'])
    expect(consoleError).toHaveBeenCalledTimes(1)
    expect(consoleError).toHaveBeenCalledWith(
      "SyntaxError: Unexpected token '%'"
    )
  })

  it('requires <in> argument', async () => {
    await expect(cli(['execute'])).rejects.toThrow(
      /Parameter 'input' is required/
    )
  })
})

describe('vars', () => {
  it('list the variables in a stencil', async () => {
    await cli(['vars', one])
    expect(consoleLog).toHaveBeenCalledWith(
      expect.objectContaining({ c: 'Number' })
    )
  })

  it('requires <in> argument', async () => {
    await expect(cli(['vars'])).rejects.toThrow(/Parameter 'input' is required/)
  })
})

describe('get', () => {
  it('gets a variable in a stencil', async () => {
    await cli(['get', one, 'c'])
    expect(consoleLog).toHaveBeenCalledWith(3)
  })

  it('requires <in> argument', async () => {
    await expect(cli(['get'])).rejects.toThrow(/Parameter 'input' is required/)
  })

  it('requires <name> argument', async () => {
    await expect(cli(['get', one])).rejects.toThrow(
      /Parameter 'name' is required/
    )
  })
})

describe('set', () => {
  it('sets a variable in a stencil', async () => {
    await cli(['set', one, 'foo', 'bar'])
    expect(consoleLog).toHaveBeenCalledWith(undefined)
  })

  it('requires <in> argument', async () => {
    await expect(cli(['set'])).rejects.toThrow(/Parameter 'input' is required/)
  })

  it('requires <name> argument', async () => {
    await expect(cli(['set', one])).rejects.toThrow(
      /Parameter 'name' is required/
    )
  })

  it('requires <value> argument', async () => {
    await expect(cli(['set', one, 'name'])).rejects.toThrow(
      /Parameter 'value' is required/
    )
  })
})

describe('run', () => {
  const jesta = new Jesta('index.js')
  const executeMock = jest.fn(() => Promise.resolve(null))
  jesta.execute = executeMock
  const serveMock = jest.fn(() => Promise.resolve())
  jesta.serve = serveMock

  it('executes and runs the stencil', async () => {
    await run.bind(jesta)(['run', one, 'foo', 'bar'])
    expect(executeMock).toHaveBeenCalled()
    expect(serveMock).toHaveBeenCalled()
  })

  it('requires <in> argument', async () => {
    await expect(run.bind(jesta)(['run'])).rejects.toThrow(
      /Parameter 'input' is required/
    )
  })
})

describe('pipe', () => {
  const jesta = new Jesta('index.js')
  const cleanMock = jest.fn(() => Promise.resolve(null))
  jesta.clean = cleanMock
  const compileMock = jest.fn(() => Promise.resolve(null))
  jesta.compile = compileMock
  const buildMock = jest.fn(() => Promise.resolve(null))
  jesta.build = buildMock

  it('executes and runs the stencil', async () => {
    const temp = tempy.file({ extension: 'json' })
    await run.bind(jesta)(['clean+compile+build', one, temp])
    expect(cleanMock).toHaveBeenCalled()
    expect(compileMock).toHaveBeenCalled()
    expect(buildMock).toHaveBeenCalled()
  })

  it('requires <in> argument', async () => {
    await expect(run.bind(jesta)(['pipe'])).rejects.toThrow(
      /Parameter 'input' is required/
    )
  })
})

describe('help', () => {
  it('is shown if no command supplied', async () => {
    await cli([])
    expect(consoleLog).toHaveBeenCalledTimes(1)
    expect(consoleLog).toHaveBeenCalledWith(expect.stringMatching(/^jesta /))
  })

  it('is shown if command is `help`', async () => {
    await cli(['help'])
    expect(consoleLog).toHaveBeenCalledTimes(1)
    expect(consoleLog).toHaveBeenCalledWith(expect.stringMatching(/^jesta /))
  })
})

test('unknown command', async () => {
  await cli(['foo'])
  expect(consoleLog).toHaveBeenCalledTimes(0)
  expect(consoleError).toHaveBeenCalledTimes(1)
  expect(consoleError).toHaveBeenCalledWith(
    expect.stringMatching(/^Unknown command "foo"/)
  )
})
