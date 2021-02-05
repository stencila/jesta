import crypto from 'crypto'
import fs from 'fs'
import Keyv from 'keyv'
import path from 'path'
import { promisify } from 'util'

/**
 * Cache class that implements the methods required to
 * act as a Keyv storage adapter.
 *
 * Stores values as files in a Stencila cache directory intended to
 * be used across applications and plugins.
 *
 * Note that this differs from https://github.com/zaaack/keyv-file in that
 * if persists values across processes. This is important for CLI applications
 * since you do not want to create a new cache for every invocation (as
 * does `keyv-file` by default).
 */
export class Cache implements Keyv.Store<string> {
  /**
   * The directory for the cache files.
   */
  private dir: string

  maximumSize = 950

  cleanupInterval = 10

  public constructor() {
    const dir = (this.dir = '/tmp/cache')
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    else this.cleanup()
    setInterval(() => this.cleanup(), this.cleanupInterval * 1000)
  }

  /**
   * Generates a file name within the cache directory.
   *
   * Use a hash to avoid invalid characters and names
   * that are too long. Use SHA1 because faster than SHA256
   * and does not need to be secure.
   */
  private filename(key: string): string {
    const filename = crypto.createHash('sha1').update(key).digest('hex')
    return path.join(this.dir, filename)
  }

  /**
   * Set a value to be cached.
   */
  public set(key: string, value: string): void {
    fs.writeFileSync(this.filename(key), value, 'utf8')
  }

  /**
   * Get a value from the cache.
   */
  public get(key: string): string | undefined {
    try {
      return fs.readFileSync(this.filename(key), 'utf8')
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error.code === 'ENOENT') return undefined
      throw error
    }
  }

  /**
   * Delete a value from the cache.
   */
  public delete(key: string): boolean {
    try {
      fs.unlinkSync(this.filename(key))
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error.code !== 'ENOENT') throw error
    }
    return true
  }

  /**
   * Clear the cache completely.
   */
  public clear(): void {
    return fs.rmdirSync(this.dir, { recursive: true })
  }

  /**
   * If the cache directory has gone over the maximum size remove
   * the files that are least recently accessed.
   */
  cleanup(): void {
    const doit = async (): Promise<void> => {
      const names = await promisify(fs.readdir)(this.dir)
      const files = await Promise.all(
        names.map(async (name) => {
          const path_ = path.join(this.dir, name)
          const stats = await promisify(fs.stat)(path_)
          return {
            path: path_,
            stats,
          }
        })
      )
      const total = files.reduce((prev, file) => prev + file.stats.size, 0)
      if (total > this.maximumSize) {
        const sorted = files.sort((a, b) => a.stats.atimeMs - b.stats.atimeMs)
        let remain = total
        for (const file of sorted) {
          if (remain <= this.maximumSize) break
          fs.unlinkSync(file.path)
          remain -= file.stats.size
        }
      }
    }
    doit().catch(console.error)
  }
}

export const cache = new Cache()
