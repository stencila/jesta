import { Entity } from '@stencila/schema'
import { Method } from '../methods/method'
import crypto from 'crypto'

interface Entry {
  plugin: string
  time: string
  seconds: number
  md5json: string
}

type History = {
  [key in Method]: Entry
}

const md5json = (entity: Entity): string => {
  const json = JSON.stringify(
    entity,
    (key: string, value: unknown): unknown => {
      return key === 'meta' ? undefined : value
    }
  )
  return crypto.createHash('md5').update(json).digest('hex')
}

export const needed = (entity: Entity, method: Method): boolean => {
  const { meta = {}, ...rest } = entity
  const { history = {} } = meta as { history: Record<string, Entry> }
  const previous = history[method]
  if (previous === undefined) return true
  return previous.md5json !== md5json(rest)
}

export const record = (
  entity: Entity,
  method: Method,
  seconds: number
): Entity => {
  const { meta: { history = {}, ...metaRest } = {}, ...entityRest } = entity
  return {
    ...entityRest,
    meta: {
      ...metaRest,
      history: {
        ...(history as History),
        [method]: {
          plugin: 'jesta',
          time: new Date().toISOString(),
          seconds,
          md5json: md5json(entityRest),
        },
      },
    },
  }
}
