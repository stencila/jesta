import { CodeChunk, Entity, isA } from '@stencila/schema'
import { mutate } from '../utilities/walk'
import * as timer from '../utilities/timer'
import { Method } from './method'
import { needed, record } from '../utilities/changes'
import * as acorn from 'acorn'
import * as acornWalk from 'acorn-walk'
import * as estree from 'estree'

export const compile = (entity: Entity): Entity => {
  // Compile code chunks and expressions
  if (isA('CodeChunk', entity) || isA('CodeExpression', entity)) {
    const { programmingLanguage, text } = entity
    if (['js', 'javascript'].includes(programmingLanguage ?? '')) {
      if (!needed(entity, Method.compile)) return entity
      const start = timer.start()
      const props = compileCode(text)
      const compiled = { ...entity, ...props }
      return record(compiled, Method.compile, timer.seconds(start))
    }
  }

  // Walk over other node types
  return mutate(entity, compile)
}

export const compileCode = (
  code: string
): Pick<CodeChunk, 'alters' | 'assigns' | 'declares' | 'imports' | 'uses'> => {
  // Properties of CodeChunk nodes which we will derive from it's code
  const alters: string[] = []
  const assigns: string[] = []
  const declares: string[] = []
  const imports: string[] = []
  const uses: string[] = []
  const props: Record<string, string[]> = {
    alters,
    assigns,
    declares,
    imports,
    uses,
  }

  const comments: acorn.Comment[] = []
  const ast = acorn.parse(code, {
    sourceType: 'module',
    ecmaVersion: 'latest',
    onComment: comments,
  })
  acornWalk.ancestor(ast, {
    // TODO: See if there is a way to reduce the following casts
    // Some may be necessary, are definitely unsafe
    // See https://github.com/acornjs/acorn/issues/906#issuecomment-604108455

    VariableDeclaration(node) {
      const { declarations } = (node as unknown) as estree.VariableDeclaration
      for (const decl of declarations) {
        const { id, init } = decl
        const { name } = id as estree.Identifier
        declares.push(name)
      }
    },

    FunctionDeclaration(node) {
      const { id } = (node as unknown) as estree.FunctionDeclaration
      const { name } = id as estree.Identifier
      if (!declares.includes(name)) assigns.push(name)
    },

    AssignmentExpression(node, state) {
      const { left, right } = (node as unknown) as estree.AssignmentExpression
      const { name } = left as estree.Identifier
      if (!assigns.includes(name)) assigns.push(name)
    },

    CallExpression(node) {
      const {
        callee,
        arguments: args,
      } = (node as unknown) as estree.CallExpression
      const { name } = callee as estree.Identifier
      if (name === 'require') {
        const { value } = args[0] as estree.Literal
        if (typeof value === 'string' && !imports.includes(value))
          imports.push(value)
      }
    },

    Identifier(node) {
      const { name } = (node as unknown) as estree.Identifier
      if (!declares.includes(name) && !uses.includes(name)) uses.push(name)
    },
  })

  // Users can manually specify properties using special comments
  for (const comment of comments) {
    const { value } = comment
    const match = /^\s*@\s*(alters|assigns|declares|imports|uses)\s+(.+)/.exec(
      value
    )
    if (match) {
      const prop = match[1]
      const values = match[2].split(/\s+/)
      props[prop].push(...values)
    }
  }

  return {
    alters: alters.length > 0 ? alters : undefined,
    assigns: assigns.length > 0 ? assigns : undefined,
    declares: declares.length > 0 ? declares : undefined,
    imports: imports.length > 0 ? imports : undefined,
    uses: uses.length > 0 ? uses : undefined,
  }
}
