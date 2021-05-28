import { stdin as mockStdin } from 'mock-stdin'
import nock from 'nock'
import { read, readFile, readHttp, readStdio } from './read'

describe('read', () => {
  it('handles a string:// URL', async () => {
    expect(await read('string://foo')).toEqual(['foo', undefined])
  })

  it('handles a stdio:// URL', async () => {
    const stdin = mockStdin()
    setTimeout(() => {
      stdin.send('beep')
      stdin.end()
    }, 100)
    expect(await read('stdio://')).toEqual(['beep', undefined])
  })

  it('handles a stdin:// URL', async () => {
    const stdin = mockStdin()
    setTimeout(() => {
      stdin.send('boop')
      stdin.end()
    }, 100)
    expect(await read('stdin://')).toEqual(['boop', undefined])
  })

  it('handles a http:// URL', async () => {
    nock('http://example.org').get('/').reply(200, 'beep')
    expect(await read('http://example.org')).toEqual(['beep', undefined])

    nock('https://example.org').get('/').reply(200, 'boop')
    expect(await read('https://example.org')).toEqual(['boop', undefined])
  })

  it('throws a capability error for unknown protocols', async () => {
    await expect(read('foo://bar')).rejects.toThrow(
      /Incapable of read over protocol "foo"/
    )
  })

  it('throws a capability error for non URLs', async () => {
    await expect(read('foo bar')).rejects.toThrow(
      /Incapable of read from URL "foo bar"/
    )
  })
})

test('readStdin', async () => {
  const stdin = mockStdin()
  setTimeout(() => {
    stdin.send('yoyo')
    stdin.end()
  }, 100)

  expect(await readStdio()).toEqual('yoyo')
})

describe('readFile', () => {
  it('returns a format based on filename extension', async () => {
    const [content, mediaType] = await readFile(__filename)
    expect(content).toMatch(/^import/)
    expect(mediaType).toBe('ts')
  })
})

describe('readHttp', () => {
  it('returns a media type based on content-type header', async () => {
    nock('http://example.org').get('/data').reply(200, '[]', {
      'Content-Type': 'application/json',
    })

    const [content, mediaType] = await readHttp('http://example.org/data')
    expect(content).toMatch('[]')
    expect(mediaType).toBe('json')
  })

  it('falls back to media type based on extension if no content-type header', async () => {
    nock('http://example.org').get('/data.json').reply(200, '[]')

    const [content, mediaType] = await readHttp('http://example.org/data.json')
    expect(content).toMatch('[]')
    expect(mediaType).toBe('json')
  })

  it('both content-type and extension are overridden by format arg', async () => {
    nock('http://example.org').get('/data.html').reply(200, 'beep, boop', {
      'Content-Type': 'application/json',
    })

    const [content, format] = await readHttp('http://example.org/data.html')
    expect(content).toMatch('beep, boop')
    expect(format).toBe('json')
  })
})
