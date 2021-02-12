import { codeChunk, codeExpression, datatable, isA } from '@stencila/schema'
import { Jesta } from '.'

const jesta = new Jesta('')

const stencil1 = 'file://some/file.Rmd'

test('context initially has no vars', async () => {
  expect(await jesta.vars(stencil1)).toEqual({})
  expect(await jesta.get(stencil1, 'a')).toBeUndefined()
})

test('vars can be added using set', async () => {
  await jesta.set(stencil1, 'a', true)
  expect(await jesta.vars(stencil1)).toEqual({ a: 'Boolean' })
  expect(await jesta.get(stencil1, 'a')).toEqual(true)

  await jesta.set(stencil1, 'b', 3.14)
  expect(await jesta.vars(stencil1)).toEqual({ a: 'Boolean', b: 'Number' })
  expect(await jesta.get(stencil1, 'b')).toEqual(3.14)

  await jesta.set(stencil1, 'c', 'a string')
  expect(await jesta.vars(stencil1)).toEqual({
    a: 'Boolean',
    b: 'Number',
    c: 'Text',
  })
  expect(await jesta.get(stencil1, 'c')).toEqual('a string')

  await jesta.set(stencil1, 'd', datatable({ columns: [] }))
  expect(await jesta.vars(stencil1)).toEqual({
    a: 'Boolean',
    b: 'Number',
    c: 'Text',
    d: 'Datatable',
  })
  expect(await jesta.get(stencil1, 'd')).toEqual(datatable({ columns: [] }))
})

test('vars can be added using the Javascript var keyword', async () => {
  await jesta.execute(
    stencil1,
    codeChunk({ programmingLanguage: 'js', text: 'var e = 42' }),
    false
  )
  expect(await jesta.get(stencil1, 'e')).toEqual(42)
})

test('vars can used and updated in Javascript code', async () => {
  const node = await jesta.execute(
    stencil1,
    codeExpression({ programmingLanguage: 'js', text: 'e * 2' }),
    false
  )
  if (isA('CodeExpression', node)) expect(node.output).toEqual(84)
  else fail('Unexpected type')

  await jesta.execute(
    stencil1,
    codeChunk({ programmingLanguage: 'js', text: 'e = 23' }),
    false
  )
  expect(await jesta.get(stencil1, 'e')).toEqual(23)
})

test('vars can be deleted', async () => {
  await jesta.delete(stencil1, 'a')
  expect(await jesta.get(stencil1, 'a')).toBeUndefined()

  await jesta.delete(stencil1, 'e')
  expect(Object.keys(await jesta.vars(stencil1))).toEqual(['b', 'c', 'd'])
})
