import path from 'path'

export function fixture(...args: string[]): string {
  return path.join(__dirname, 'fixtures', ...args)
}
