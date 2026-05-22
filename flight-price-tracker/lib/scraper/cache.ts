interface CacheEntry<T> {
  data: T
  expiresAt: number
}

export class TTLCache<T> {
  private store = new Map<string, CacheEntry<T>>()
  private readonly ttlMs: number
  private readonly maxEntries: number

  constructor(ttlMs: number, maxEntries = 100) {
    this.ttlMs = ttlMs
    this.maxEntries = maxEntries
  }

  get(key: string): T | undefined {
    const entry = this.store.get(key)
    if (!entry) return undefined
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key)
      return undefined
    }
    return entry.data
  }

  set(key: string, value: T): void {
    if (this.store.size >= this.maxEntries) {
      const oldest = this.store.keys().next().value
      if (oldest !== undefined) this.store.delete(oldest)
    }
    this.store.set(key, { data: value, expiresAt: Date.now() + this.ttlMs })
  }

  has(key: string): boolean {
    return this.get(key) !== undefined
  }

  clear(): void {
    this.store.clear()
  }

  get size(): number {
    return this.store.size
  }
}

export const CACHE_TTL_FLIGHTS = 10 * 60 * 1000
export const CACHE_TTL_PRICES = 30 * 60 * 1000
