import { CodeChunk, codeChunk, codeError } from '@stencila/schema'
import { Jesta } from '.'

const jesta = new Jesta()

async function executeCodeChunk(text: string): Promise<CodeChunk> {
  return jesta.execute(
    codeChunk({
      text,
      programmingLanguage: 'javascript',
    }),
    false
  ) as Promise<CodeChunk>
}

describe('errors', () => {
  it('syntax error to errors', async () => {
    const chunk = await executeCodeChunk('^%^@$&%*^(&@')
    expect(chunk.outputs).toEqual(undefined)
    expect(chunk.errors).toEqual([
      codeError({
        errorType: 'SyntaxError',
        errorMessage: "Unexpected token '^'",
        stackTrace: "\nSyntaxError: Unexpected token '^'\n",
      }),
    ])
  })
})
