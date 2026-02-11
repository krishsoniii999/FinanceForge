interface CacheEntry<T> {
  data: T
  expires: number
}

class MemoryCache {
  private store = new Map<string, CacheEntry<any>>()

  get<T>(key: string): T | null {
    const entry = this.store.get(key)
    if (!entry) return null
    if (Date.now() > entry.expires) {
      this.store.delete(key)
      return null
    }
    return entry.data as T
  }

  set<T>(key: string, data: T, ttlSeconds: number): void {
    this.store.set(key, {
      data,
      expires: Date.now() + ttlSeconds * 1000,
    })
  }

  clear(): void {
    this.store.clear()
  }

  size(): number {
    return this.store.size
  }
}

export const cache = new MemoryCache()
