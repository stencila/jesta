import { stdin as mockStdin } from 'mock-stdin'
import nock from 'nock'
import { read, readFile, readHttp, readStdin } from './read'

describe('read', () => {
  it('handles a string:// URL', async () => {
    expect(await read('string://foo')).toEqual(['foo', ''])
    expect(await read('string://foo', 'md')).toEqual(['foo', 'text/markdown'])
    expect(await read('string://foo', 'text/markdown')).toEqual([
      'foo',
      'text/markdown',
    ])
  })

  it('handles a string with no URL prefix', async () => {
    expect(await read('foo')).toEqual(['foo', ''])
    expect(await read('foo', 'html')).toEqual(['foo', 'text/html'])
    expect(await read('{}', 'application/json+ld')).toEqual([
      '{}',
      'application/json+ld',
    ])
  })

  it('handles a http:// URL', async () => {
    nock('http://example.org').get('/').reply(200, 'beep')
    expect(await read('http://example.org')).toEqual(['beep', ''])

    nock('https://example.org').get('/').reply(200, 'boop')
    expect(await read('https://example.org', 'json')).toEqual([
      'boop',
      'application/json',
    ])
  })

  it('throws a capability error for unhandled protocols', async () => {
    await expect(read('foo://bar')).rejects.toThrow(
      /Incapable of read over protocol "foo"/
    )
  })
})

test('readStdin', async () => {
  const stdin = mockStdin()
  setTimeout(() => {
    stdin.send('yoyo')
    stdin.end()
  }, 100)

  expect(await readStdin()).toEqual('yoyo')
})

describe('readFile', () => {
  it('returns a media type based on filename extension', async () => {
    const [content, mediaType] = await readFile(__filename)
    expect(content).toMatch(/^import/)
    expect(mediaType).toBe('video/mp2t')
  })

  it('returns a media type if one is supplied', async () => {
    const [content, mediaType] = await readFile(
      __filename,
      'application/typescript'
    )
    expect(content).toMatch(/^import/)
    expect(mediaType).toBe('application/typescript')
  })

  it('returns a media type if an extension is supplied', async () => {
    const [content, mediaType] = await readFile(__filename, 'md')
    expect(content).toMatch(/^import/)
    expect(mediaType).toBe('text/markdown')
  })
})

describe('readHttp', () => {
  it('returns a media type based on content-type header', async () => {
    nock('http://example.org').get('/data').reply(200, '[]', {
      'Content-Type': 'application/json',
    })

    const [content, mediaType] = await readHttp('http://example.org/data')
    expect(content).toMatch('[]')
    expect(mediaType).toBe('application/json')
  })

  it('falls back to media type based on extension if no content-type header', async () => {
    nock('http://example.org').get('/data.json').reply(200, '[]')

    const [content, mediaType] = await readHttp('http://example.org/data.json')
    expect(content).toMatch('[]')
    expect(mediaType).toBe('application/json')
  })

  it('both content-type and extension are overridden by format arg', async () => {
    nock('http://example.org').get('/data.html').reply(200, 'beep, boop', {
      'Content-Type': 'application/json',
    })

    const [content, mediaType] = await readHttp(
      'http://example.org/data.html',
      'csv'
    )
    expect(content).toMatch('beep, boop')
    expect(mediaType).toBe('text/csv')
  })
})
