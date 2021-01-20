import { Entity, isA } from '@stencila/schema'
import { mutate } from '../utilities/walk'

export const clean = (entity: Entity): Entity => {
  if (isA('CodeChunk', entity)) {
    delete entity.alters
    delete entity.assigns
    delete entity.declares
    delete entity.imports
    delete entity.reads
    delete entity.uses
  }

  delete entity.meta?.history
  if (entity.meta && Object.keys(entity.meta).length == 0) delete entity.meta

  return mutate(entity, clean)
}
