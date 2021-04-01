import {
  Article,
  article,
  date,
  heading,
  organization,
  Person,
  person,
} from '@stencila/schema'
import { Jesta } from '.'
import { defaultForType, parseDate } from './validate'

const jesta = new Jesta()

test('primitive nodes are unchanged', async () => {
  expect(await jesta.validate(null)).toBe(null)
  expect(await jesta.validate(true)).toBe(true)
  expect(await jesta.validate(42)).toBe(42)
  expect(await jesta.validate('string')).toBe('string')
})

test('plain objects and arrays are unchanged', async () => {
  expect(await jesta.validate({})).toEqual({})
  expect(await jesta.validate({ a: 'A', b: 'B' })).toEqual({ a: 'A', b: 'B' })

  expect(await jesta.validate([])).toEqual([])
  expect(await jesta.validate([1, 2, 3])).toEqual([1, 2, 3])
})

test('will coerce property types', async () => {
  expect(await jesta.validate({ type: 'Person', name: 42 })).toEqual(
    person({ name: '42' })
  )

  expect(await jesta.validate({ type: 'Person', name: null })).toEqual(
    person({ name: '' })
  )
})

test('will remove additional properties', async () => {
  expect(
    await jesta.validate({
      type: 'Person',
      name: 'John',
      foo: 'bar',
      affiliations: [
        {
          type: 'Organization',
          name: 'Acme PLC',
          beep: 'boop',
        },
      ],
    })
  ).toEqual(
    person({
      name: 'John',
      affiliations: [{ type: 'Organization', name: 'Acme PLC' }],
    })
  )

  expect(
    await jesta.validate({ type: 'Person', favoriteColour: 'pink' })
  ).toEqual(person())
})

test('will coerce arrays of primitives to scalars', async () => {
  expect(
    await jesta.validate({
      type: 'Person',
      name: [42],
    })
  ).toEqual(person({ name: '42' }))

  expect(
    await jesta.validate({
      type: 'Person',
      name: ['First', 'Second'],
    })
  ).toEqual(person({ name: 'First' }))
})

test('will coerce scalars to arrays', async () => {
  expect(
    await jesta.validate({
      type: 'Person',
      givenNames: 'Jane',
    })
  ).toEqual(person({ givenNames: ['Jane'] }))

  // e.g. person only affiliated with one organization
  expect(
    await jesta.validate({
      type: 'Person',
      affiliation: { type: 'Organization' },
    })
  ).toEqual(person({ affiliations: [{ type: 'Organization' }] }))

  // e.g. article only has one author, with one affiliation
  expect(
    await jesta.validate({
      type: 'Article',
      title: 'An article',
      author: {
        type: 'Person',
        affiliation: {
          type: 'Organization',
        },
      },
    })
  ).toEqual(
    article({
      title: 'An article',
      authors: [person({ affiliations: [organization()] })],
    })
  )
})

test('will add default values for missing properties', async () => {
  expect(await jesta.validate({ type: 'Heading' })).toEqual(
    heading({ content: [] })
  )
})

test('defaults for different JSON Schema types', () => {
  expect(defaultForType('null')).toBe(null)
  expect(defaultForType('boolean')).toBe(false)
  expect(defaultForType('number')).toBe(0)
  expect(defaultForType('integer')).toBe(0)
  expect(defaultForType('string')).toBe('')
  expect(defaultForType('array')).toEqual([])
  expect(defaultForType('object')).toEqual({})
  // @ts-expect-error because there's no type foo
  expect(defaultForType('foo')).toBe('')
})

test('will coerce properties using parsers', async () => {
  const article = (await jesta.validate({
    type: 'Article',
    datePublished: '1 Sept 2013',
    authors: 'Mr John Doe',
    keywords: 'hello world, testing',
  })) as Article

  expect(article.datePublished).toEqual(date({ value: '2013-09-01' }))
  expect(article?.authors?.[0]).toEqual(
    person({
      givenNames: ['John'],
      familyNames: ['Doe'],
      honorificPrefix: 'Mr',
    })
  )
  expect(article?.keywords).toEqual(['hello world', 'testing'])
})

test('will parse various date formats', () => {
  // Valid ISO dates, explicitly or assumed to be UTC
  for (const value of [
    '1990',
    '1990-01',
    '1990-01-01',
    '1990-01-01T00',
    '1990-01-01T00:00',
    '1990-01-01T00:00:00',
    '1990-01-01T00:00:00.000',
  ]) {
    expect(parseDate(value)).toEqual(date({ value }))
  }

  // Explicit TZ
  expect(parseDate('2021-04-01T07:28:19+13:00')).toEqual(
    date({ value: '2021-03-31T18:28:19.000Z' })
  )

  // Non-ISO dates
  expect(parseDate('3 Jan 2004')).toEqual(date({ value: '2004-01-03' }))
  expect(parseDate('1/3/2004')).toEqual(date({ value: '2004-01-03' }))
})

test('will coerce nested nodes', async () => {
  const article = (await jesta.validate({
    type: 'Article',
    authors: [
      {
        type: 'Person',
        givenNames: 'Joe',
        affiliations: [
          {
            type: 'Organization',
            name: ['Acme Ltd'],
          },
        ],
      },
      {
        type: 'Person',
        firstNames: ['Jane', 'Jill'],
        lastNames: 'Jones',
      },
      'Pete Pan <pete@example.com>',
    ],
  })) as Article

  const joe = article?.authors?.[0] as Person
  expect(joe.givenNames).toEqual(['Joe']) // coerced to an array
  expect(joe.affiliations?.[0].name).toEqual('Acme Ltd') // coerced to a string

  const jane = article?.authors?.[1] as Person
  expect(jane.givenNames).toEqual(['Jane', 'Jill']) // renamed
  expect(jane.familyNames).toEqual(['Jones']) // renamed & coerced to an array

  const pete = article?.authors?.[2] as Person
  expect(pete.emails).toEqual(['pete@example.com']) // parsed
})

test('will modify the original node (i.e. coercion has side effects)', async () => {
  const node = {
    type: 'Article',
    name: 42,
  }
  await jesta.validate(node)

  expect(node.name).toBe('42')
})

test('throws an error if unable to coerce data, or data is otherwise invalid', async () => {
  await expect(jesta.validate({ type: 'Person', name: {} })).rejects.toThrow(
    'must be string'
  )

  await expect(jesta.validate({ type: 'Person', url: 'foo' })).rejects.toThrow(
    'must match format "uri"'
  )
})

test('throws an error if not coercing and invalid data', async () => {
  await expect(jesta.validate({ type: 'Paragraph' }, false)).rejects.toThrow(
    "must have required property 'content'"
  )
})

test('throws an error for type with no schema', async () => {
  await expect(jesta.validate({ type: 'Foo' })).rejects.toThrow(
    'No schema for node type Foo'
  )
})
