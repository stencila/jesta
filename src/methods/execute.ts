import { Entity, isA } from '@stencila/schema'
// import repl from 'repl'
import { record } from '../utilities/changes'
import * as timer from '../utilities/timer'
import { mutate } from '../utilities/walk'
import { Method } from './method'

// TODO: Use this or `vm` module?
// let session: repl.REPLServer

export const execute = (entity: Entity): Entity => {
  if (isA('CodeExpression', entity) || isA('CodeBlock', entity)) {
    const { programmingLanguage } = entity
    if (['js', 'javascript'].includes(programmingLanguage ?? '')) {
      const start = timer.start()

      // TODO: Perform execution

      return record(entity, Method.execute, timer.seconds(start))
    }
  }

  return mutate(entity, execute)
}
