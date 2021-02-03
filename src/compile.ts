import { CodeChunk, isA, Node } from '@stencila/schema'
import * as acorn from 'acorn'
import * as acornWalk from 'acorn-walk'
import * as estree from 'estree'
import { Jesta } from '.'
import { Method } from './types'
import { needed, record } from './util/changes'
import * as timer from './util/timer'
import { mutate } from './util/walk'

/* eslint-disable @typescript-eslint/require-await */
export async function compile(
  this: Jesta,
  node: Node,
  force: boolean
): Promise<Node> {
  // Compile code chunks and expressions with Javascript code
  if (isA('CodeChunk', node) || isA('CodeExpression', node)) {
    const { programmingLanguage, text } = node
    if (['js', 'javascript'].includes(programmingLanguage ?? '')) {
      // Skip if not needed
      if (!force && !needed(node, Method.compile)) return node

      const start = timer.start()
      const props = compileCode(text)
      const compiled = { ...node, ...props }
      return record(compiled, Method.compile, timer.seconds(start))
    }
  }

  // Walk over other node types
  return mutate(node, (child) => this.compile(child, force))
}

export const compileCode = (
  code: string
): Pick<
  CodeChunk,
  'alters' | 'assigns' | 'declares' | 'imports' | 'reads' | 'uses'
> => {
  // Properties of code nodes which we will derive from special comments or code analysis
  const alters: string[] = []
  const assigns: string[] = []
  const declares: string[] = []
  const imports: string[] = []
  const reads: string[] = []
  const uses: string[] = []
  const props: Record<string, string[]> = {
    alters,
    assigns,
    declares,
    imports,
    reads,
    uses,
  }
  const analyse: Record<string, boolean> = {
    alters: true,
    assigns: true,
    declares: true,
    imports: true,
    reads: true,
    uses: true,
  }

  // Parse the code, keeping any comments
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

  // Users can manually specify properties using special comments starting with `@stencila-`
  // If the user uses one of these comments then code analysis for that property is ignores
  for (const comment of comments) {
    const { value } = comment
    const match = /^\s*@stencila-(alters|assigns|declares|imports|reads|uses)\s+(.+)/.exec(
      value
    )
    if (match) {
      const prop = match[1]
      const values = match[2].trim().split(/\s+/)
      props[prop].push(...values)
      analyse[prop] = false
    }
  }

  // Walk the AST and populate properties
  // For alternative walking algos see https://github.com/acornjs/acorn/tree/master/acorn-walk#interface
  acornWalk.ancestor(ast, {
    // Note: these are very preliminary implementations and do not
    // take into account things like scope. The type casts should also be replaced
    // with checks on `node.type`

    // The following `@ts-expect-error`s are necessary because we are using `estree` types
    // instead of `acorn` node type (because they are 'better').
    // See https://github.com/acornjs/acorn/issues/906#issuecomment-604108455

    // @ts-expect-error as above
    VariableDeclaration(node: estree.VariableDeclaration) {
      const { kind, declarations } = node
      if (kind !== 'var') return
      for (const decl of declarations) {
        const { id } = decl
        const { name } = id as estree.Identifier
        if (analyse.declares && !declares.includes(name)) declares.push(name)
      }
    },

    // @ts-expect-error as above
    FunctionDeclaration(node: estree.FunctionDeclaration) {
      const { id } = node
      const { name } = id as estree.Identifier
      if (analyse.declares && !declares.includes(name)) declares.push(name)
    },

    // @ts-expect-error as above
    AssignmentExpression(node: estree.AssignmentExpression) {
      const { left } = node
      const { name } = left as estree.Identifier
      if (analyse.assigns && !assigns.includes(name)) assigns.push(name)
    },

    // @ts-expect-error as above
    CallExpression(node: estree.CallExpression) {
      const { callee, arguments: args } = node
      let name
      if (callee.type === 'Identifier') {
        name = callee.name
      } else {
        return
      }

      if (name === 'require') {
        const { value } = args[0] as estree.Literal
        if (
          typeof value === 'string' &&
          analyse.imports &&
          !imports.includes(value)
        )
          imports.push(value)
      } else if (['readFile', 'readFileSync'].includes(name)) {
        const { value } = args[0] as estree.Literal
        if (
          typeof value === 'string' &&
          analyse.reads &&
          !reads.includes(value)
        )
          reads.push(value)
      }
    },

    // @ts-expect-error as above
    Identifier(node: estree.Identifier) {
      const { name } = node
      if (!declares.includes(name) && analyse.uses && !uses.includes(name))
        uses.push(name)
    },
  })

  return {
    alters: alters.length > 0 ? alters : undefined,
    assigns: assigns.length > 0 ? assigns : undefined,
    declares: declares.length > 0 ? declares : undefined,
    imports: imports.length > 0 ? imports : undefined,
    reads: reads.length > 0 ? reads : undefined,
    uses: uses.length > 0 ? uses : undefined,
  }
}
