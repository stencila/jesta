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
  return JSON.parse(stdout.mock.calls.slice(-1)[0] as unknown as string)
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
        data: 'Unexpected token # in JSON at position 0',
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
        message: "Method 'foo' does not exist",
        data: 'foo',
      },
    })
  })

  test('RequiredParamError', async () => {
    const response = await request({ id: 1, method: 'decode' })
    expect(response).toEqual({
      id: 1,
      error: {
        code: -32602,
        message: "Parameter 'content' is required.",
        data: [
          {
            instancePath: '',
            keyword: 'required',
            message: "must have required property 'content'",
            params: {
              missingProperty: 'content',
            },
            schemaPath: '#/required',
          },
        ],
      },
    })
  })

  test('InvalidParamError: type', async () => {
    const response = await request({
      id: 1,
      method: 'decode',
      params: { content: 42, format: 'bar' },
    })
    expect(response).toEqual({
      id: 1,
      error: {
        code: -32602,
        message: "Parameter 'content' is invalid: must be string.",
        data: [
          {
            instancePath: '/content',
            keyword: 'type',
            message: 'must be string',
            params: {
              type: 'string',
            },
            schemaPath: '#/properties/content/type',
          },
        ],
      },
    })
  })

  test('InvalidParamError: value', async () => {
    const response = await request({
      id: 1,
      method: 'decode',
      params: { content: '{}', format: 'bar' },
    })
    expect(response).toEqual({
      id: 1,
      error: {
        code: -32602,
        message:
          "Parameter 'format' is invalid: must be equal to one of the allowed values.",
        data: [
          {
            instancePath: '/format',
            keyword: 'enum',
            message: 'must be equal to one of the allowed values',
            params: {
              allowedValues: ['json'],
            },
            schemaPath: '#/properties/format/enum',
          },
        ],
      },
    })
  })
})
