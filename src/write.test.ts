import fs from 'fs'
import tempy from 'tempy'
import { write } from './write'

const stdout = jest.spyOn(process.stdout, 'write').mockImplementation()

describe('write', () => {
  it('handles a stdio:// and stdout:// URLs', async () => {
    await write('beep', 'stdio://')
    expect(stdout).toHaveBeenCalledWith('beep')

    await write('boop', 'stdout://')
    expect(stdout).toHaveBeenCalledWith('boop')
  })

  it('handles a file:// URL', async () => {
    const temp = tempy.file()
    await write('bop', `file://${temp}`)

    expect(fs.existsSync(temp)).toBeTruthy()
  })

  it('throws a capability error for unhandled protocols', async () => {
    await expect(write('quax', 'foo://bar')).rejects.toThrow(
      /Incapable of write over protocol "foo"/
    )
  })

  it('falls back to file for non-URLs', async () => {
    const temp = tempy.file()
    await write('foo', temp)

    expect(fs.existsSync(temp)).toBeTruthy()
  })
})
