import { dispatch } from './dispatch'
import { manifest } from './manifest'
import { cli } from './cli'

if (require.main === module) cli(__filename, manifest, dispatch)
