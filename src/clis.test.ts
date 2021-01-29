import fs from 'fs'
import tempy from 'tempy'
import { Jesta } from '.'
import { fixture } from '../tests/helpers'
import { run } from './cli'

// An instance of jest which we can mock methods on
const jesta = new Jesta('index.js')

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

  return run(jesta, args)
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

describe('decode', () => {
  it('decodes input to a node and outputs it', async () => {
    await cli(['decode', one])
    expect(consoleLog).toHaveBeenCalledTimes(1)
    expect(consoleLog).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'Article' })
    )
  })

  it('requires <in> argument', async () => {
    await expect(cli(['decode'])).rejects.toThrow(
      /Parameter 'input' is required/
    )
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

  it('errors if extension formats are unsupported', async () => {
    await expect(cli(['convert', 'foo.bar', 'baz.json'])).rejects.toThrow(
      /Incapable of decoding from format "bar"/
    )
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
    await run(jesta, ['run', one, 'foo', 'bar'])
    expect(executeMock).toHaveBeenCalled()
    expect(serveMock).toHaveBeenCalled()
  })

  it('requires <in> argument', async () => {
    await expect(run(jesta, ['run'])).rejects.toThrow(
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
