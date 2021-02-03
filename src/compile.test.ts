import { CodeChunk, codeChunk } from '@stencila/schema'
import { Jesta } from '.'
import { compileCode } from './compile'

const jesta = new Jesta('')

describe('comment tags', () => {
  test.each(['alters', 'assigns', 'declares', 'imports', 'reads', 'uses'])(
    '%s',
    async (prop: string) => {
      const node = await jesta.compile(
        codeChunk({
          programmingLanguage: 'js',
          text: `// @stencila-${prop} a b c`,
        }),
        true
      )
      // @ts-expect-error using string as key
      expect(node[prop]).toEqual(['a', 'b', 'c'])
    }
  )

  test('accumulate across comments', async () => {
    const node = (await jesta.compile(
      codeChunk({
        programmingLanguage: 'js',
        text: `
// @stencila-imports foo

/* @stencila-declares a */

/* @stencila-imports bar */

// @stencila-declares b
        `,
      }),
      true
    )) as CodeChunk

    expect(node.imports).toEqual(['foo', 'bar'])
    expect(node.declares).toEqual(['a', 'b'])
  })

  test('override code analysis', async () => {
    const node = (await jesta.compile(
      codeChunk({
        programmingLanguage: 'js',
        text: `
// @stencila-imports foo bar
const baz = require('quax')

// @stencila-declares a
var b = 1

// @stencila-reads data.csv
fs.readFile('other.csv')
        `,
      }),
      true
    )) as CodeChunk

    expect(node.imports).toEqual(['foo', 'bar'])
    expect(node.declares).toEqual(['a'])
    expect(node.reads).toEqual(['data.csv'])
  })
})

describe('code analysis: declares', () => {
  test('var', () => {
    expect(compileCode('var a').declares).toEqual(['a'])
    expect(compileCode('var a = 1').declares).toEqual(['a'])
    expect(compileCode('var a,b,c').declares).toEqual(['a', 'b', 'c'])
  })

  test('let, const', () => {
    expect(compileCode('let a').declares).toBeUndefined()
    expect(compileCode('const a = 1').declares).toBeUndefined()
    expect(compileCode('let a,b,c').declares).toBeUndefined()
  })

  test('function', () => {
    expect(compileCode('function func(){}').declares).toEqual(['func'])
    expect(compileCode('var func = () => {}').declares).toEqual(['func'])
  })
})

test('code analysis: assigns', () => {
  expect(compileCode('a = 1').assigns).toEqual(['a'])
})

test('code analysis: uses', () => {
  expect(compileCode('a').uses).toEqual(['a'])
  expect(compileCode('a * b + c(d)').uses).toEqual(['a', 'b', 'c', 'd'])
})

describe('code analysis: imports', () => {
  test.each(['const foo = require("foo")', 'require("foo")'])('%s', (code) =>
    expect(compileCode(code).imports).toEqual(['foo'])
  )
})

describe('code analysis: reads', () => {
  test.each(['readFile("data.csv")', 'readFileSync("data.csv")'])(
    '%s',
    (code) => expect(compileCode(code).reads).toEqual(['data.csv'])
  )
})
