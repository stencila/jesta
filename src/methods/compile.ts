import { CodeChunk, isA, Node } from '@stencila/schema'
import * as acorn from 'acorn'
import * as acornWalk from 'acorn-walk'
import * as estree from 'estree'
import { needed, record } from '../utilities/changes'
import * as timer from '../utilities/timer'
import { mutate } from '../utilities/walk'
import { Compile, Method } from './types'

/* eslint-disable @typescript-eslint/require-await */
export const compile: Compile = async (
  node: Node,
  force = false
): Promise<Node> => {
  // Compile code chunks and expressions
  if (isA('CodeChunk', node) || isA('CodeExpression', node)) {
    const { programmingLanguage, text } = node
    if (['js', 'javascript'].includes(programmingLanguage ?? '')) {
      if (!force && !needed(node, Method.compile)) return node

      const start = timer.start()
      const props = compileCode(text)
      const compiled = { ...node, ...props }
      return record(compiled, Method.compile, timer.seconds(start))
    }
  }

  // Walk over other node types
  return mutate(node, (child) => compile(child, force))
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
  let ast
  try {
    ast = acorn.parse(code, {
      sourceType: 'module',
      ecmaVersion: 'latest',
      onComment: comments,
    })
  } catch (error) {
    // Syntax error when parsing code, so just return undefined
    // for all properties
    return {}
  }

  acornWalk.ancestor(ast, {
    // TODO: See if there is a way to reduce the following casts
    // Some may be necessary, are definitely unsafe
    // See https://github.com/acornjs/acorn/issues/906#issuecomment-604108455

    VariableDeclaration(node) {
      const { declarations } = (node as unknown) as estree.VariableDeclaration
      for (const decl of declarations) {
        const { id } = decl
        const { name } = id as estree.Identifier
        declares.push(name)
      }
    },

    FunctionDeclaration(node) {
      const { id } = (node as unknown) as estree.FunctionDeclaration
      const { name } = id as estree.Identifier
      if (!declares.includes(name)) assigns.push(name)
    },

    AssignmentExpression(node) {
      const { left } = (node as unknown) as estree.AssignmentExpression
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
