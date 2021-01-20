import { cli } from './cli'
import { dispatch } from './dispatch'
import { manifest } from './manifest'

export * from './cli'
export * from './dispatch'
export * from './manifest'
export * from './methods'
export * from './register'
export * from './serve'

if (require.main === module) cli(__filename, manifest, dispatch)
