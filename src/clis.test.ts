import { Jesta } from '.'

const consoleLog = jest.spyOn(console, 'log').mockImplementation()
const consoleWarn = jest.spyOn(console, 'warn').mockImplementation()
const consoleError = jest.spyOn(console, 'error').mockImplementation()

function cli(args: string[]): void {
  consoleLog.mockClear()
  consoleWarn.mockClear()
  consoleError.mockClear()

  const jesta = new Jesta()
  process.argv = ['node', 'some/index.js', ...args]
  jesta.cli('some/index.js')
}

describe('help', () => {
  it('is shown if no command supplied', () => {
    cli([])
    expect(consoleLog).toHaveBeenCalledTimes(1)
    expect(consoleLog).toHaveBeenCalledWith(expect.stringMatching(/^jesta /))
  })

  it('is shown if no command is `help`', () => {
    cli(['help'])
    expect(consoleLog).toHaveBeenCalledTimes(1)
    expect(consoleLog).toHaveBeenCalledWith(expect.stringMatching(/^jesta /))
  })
})
