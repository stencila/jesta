import { codeChunk, codeExpression, datatable, isA } from '@stencila/schema'
import { Jesta } from '.'

const jesta = new Jesta('')

test('context initially has no vars', async () => {
  expect(await jesta.vars()).toEqual({})
  expect(await jesta.get('a')).toBeUndefined()
})

test('vars can be added using set', async () => {
  await jesta.set('a', true)
  expect(await jesta.vars()).toEqual({ a: 'Boolean' })
  expect(await jesta.get('a')).toEqual(true)

  await jesta.set('b', 3.14)
  expect(await jesta.vars()).toEqual({ a: 'Boolean', b: 'Number' })
  expect(await jesta.get('b')).toEqual(3.14)

  await jesta.set('c', 'a string')
  expect(await jesta.vars()).toEqual({ a: 'Boolean', b: 'Number', c: 'Text' })
  expect(await jesta.get('c')).toEqual('a string')

  await jesta.set('d', datatable({ columns: [] }))
  expect(await jesta.vars()).toEqual({
    a: 'Boolean',
    b: 'Number',
    c: 'Text',
    d: 'Datatable',
  })
  expect(await jesta.get('d')).toEqual(datatable({ columns: [] }))
})

test('vars can be added using the Javascript var keyword', async () => {
  await jesta.execute(
    codeChunk({ programmingLanguage: 'js', text: 'var e = 42' }),
    false
  )
  expect(await jesta.get('e')).toEqual(42)
})

test('vars can used and updated in Javascript code', async () => {
  const node = await jesta.execute(
    codeExpression({ programmingLanguage: 'js', text: 'e * 2' }),
    false
  )
  if (isA('CodeExpression', node)) expect(node.output).toEqual(84)
  else fail('Unexpected type')

  await jesta.execute(
    codeChunk({ programmingLanguage: 'js', text: 'e = 23' }),
    false
  )
  expect(await jesta.get('e')).toEqual(23)
})

test('vars can be deleted', async () => {
  await jesta.delete('a')
  expect(await jesta.get('a')).toBeUndefined()

  await jesta.delete('e')
  expect(Object.keys(await jesta.vars())).toEqual(['b', 'c', 'd'])
})
