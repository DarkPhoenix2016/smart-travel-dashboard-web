class CacheManager {
  constructor() {
    this.cache = new Map()
  }

  set(key, value, ttl = 300) {
    // Default 5 minutes
    const expiresAt = Date.now() + ttl * 1000
    this.cache.set(key, { value, expiresAt })
  }

  get(key) {
    const item = this.cache.get(key)
    if (!item) return null

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key)
      return null
    }

    return item.value
  }

  clear(key) {
    this.cache.delete(key)
  }

  clearAll() {
    this.cache.clear()
  }
}

export const cacheManager = new CacheManager()

export function createCacheKey(...parts) {
  return parts.join(":")
}
