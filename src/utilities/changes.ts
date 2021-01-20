import { Entity } from '@stencila/schema'
import { Method } from '../methods/method'
import crypto from 'crypto'

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
  const { history = {} } = meta
  const previous = history[method]
  if (previous === undefined) return true
  return previous.md5json !== md5json(entity)
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
        ...history,
        [method]: {
          plugin: 'noda',
          time: new Date().toISOString(),
          seconds,
          md5json: md5json(entityRest),
        },
      },
    },
  }
}
