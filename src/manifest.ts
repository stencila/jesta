import fs from 'fs'
import path from 'path'

import { Jesta } from '.'
import { Manifest } from './types'

export function manifest(this: Jesta): Manifest {
  const json = fs.readFileSync(
    path.join(__dirname, '..', 'codemeta.json'),
    'utf8'
  )
  const manifest = JSON.parse(json) as Manifest
  return manifest
}
