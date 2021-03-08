import { MockSTDIN, stdin as mockStdin } from 'mock-stdin'
import { Jesta } from '.'

const jesta = new Jesta()

let stdin: MockSTDIN
let stdout = jest.spyOn(process.stdout, 'write').mockImplementation()

beforeEach(() => {
  stdin = mockStdin()
  stdout = jest.spyOn(process.stdout, 'write').mockImplementation()
})

// Mock sending a message to the server
function send(request: string | unknown): void {
  process.nextTick(() => {
    stdin.send(
      typeof request === 'string' ? request : JSON.stringify(request) + '\n'
    )
    stdin.end()
  })
}

// Mock receive a message from the server
function receive(): unknown {
  return JSON.parse((stdout.mock.calls.slice(-1)[0] as unknown) as string)
}

// Mock a send-receive round trip to server
async function request(request: string | unknown): Promise<unknown> {
  send(request)
  await jesta.serve()
  return receive()
}

describe('errors', () => {
  test('ParseError', async () => {
    const response = await request('#&*(*@^&^')
    expect(response).toEqual({
      error: {
        code: -32700,
        message:
          'Error while parsing request: Unexpected token # in JSON at position 0',
      },
    })
  })

  test('InvalidRequestError', async () => {
    const response = await request({})
    expect(response).toEqual({
      error: {
        code: -32600,
        message: 'Request is invalid because it is missing an id or method',
      },
    })
  })

  test('MethodNotFoundError', async () => {
    const response = await request({ id: 1, method: 'foo' })
    expect(response).toEqual({
      id: 1,
      error: {
        code: -32601,
        message: "Method 'foo' not found",
      },
    })
  })

  test('RequiredParamError', async () => {
    const response = await request({ id: 1, method: 'decode' })
    expect(response).toEqual({
      id: 1,
      error: {
        code: -32602,
        message: "Parameter 'input' is required",
      },
    })
  })

  test('InvalidParamError', async () => {
    const response = await request({
      id: 1,
      method: 'decode',
      params: { input: null },
    })
    expect(response).toEqual({
      id: 1,
      error: {
        code: -32602,
        message: "Parameter 'input' is invalid: should be a string",
      },
    })
  })
})
