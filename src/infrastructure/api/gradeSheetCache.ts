/**
 * gradeSheetCache.ts
 *
 * Cache-aside store for GradeSheet objects.
 * Provides:
 *  - TTL-based in-memory caching (5 min by default)
 *  - In-flight request deduplication (concurrent callers share one fetch)
 *  - Batch warm-up with controlled concurrency (5 at a time)
 *  - Explicit invalidation per subject or per course
 */
import type { GradeSheet } from './gradeAdapter'

const CACHE_TTL_MS = 5 * 60 * 1000   // 5 minutes
const WARMUP_CONCURRENCY = 5          // max simultaneous warm-up fetches

interface CacheEntry {
  data: GradeSheet
  expiresAt: number
}

const cache = new Map<number, CacheEntry>()
const inFlight = new Map<number, Promise<GradeSheet>>()

export const gradeSheetCache = {
  /** Returns cached entry if still valid, otherwise null. */
  get(subjectId: number): GradeSheet | null {
    const entry = cache.get(subjectId)
    if (!entry) return null
    if (Date.now() > entry.expiresAt) {
      cache.delete(subjectId)
      return null
    }
    return entry.data
  },

  /** Stores entry in cache and removes any in-flight marker. */
  set(subjectId: number, data: GradeSheet): void {
    cache.set(subjectId, { data, expiresAt: Date.now() + CACHE_TTL_MS })
    inFlight.delete(subjectId)
  },

  /** Removes a single subject from cache and cancels any in-flight tracking. */
  invalidate(subjectId: number): void {
    cache.delete(subjectId)
    inFlight.delete(subjectId)
  },

  /** Removes all subjects that belong to the given courseId from cache. */
  invalidateByCourse(courseId: number): void {
    for (const [id, entry] of cache) {
      if (entry.data.courseId === courseId) {
        cache.delete(id)
        inFlight.delete(id)
      }
    }
  },

  /**
   * Cache-aside fetch with in-flight deduplication.
   * If the sheet is cached → returns it synchronously (via resolved promise).
   * If a fetch is already in-flight for this subjectId → returns the same promise.
   * Otherwise → calls fetcher(), caches the result, and returns the promise.
   */
  fetchOrGet(subjectId: number, fetcher: () => Promise<GradeSheet>): Promise<GradeSheet> {
    const cached = this.get(subjectId)
    if (cached) return Promise.resolve(cached)

    const existing = inFlight.get(subjectId)
    if (existing) return existing

    const promise = fetcher()
      .then(data => {
        this.set(subjectId, data)
        return data
      })
      .catch(err => {
        inFlight.delete(subjectId)
        return Promise.reject(err)
      })

    inFlight.set(subjectId, promise)
    return promise
  },

  /**
   * Pre-warms the cache for a list of subjectIds in the background.
   * Skips subjects that are already cached or being fetched.
   * Batches requests to avoid overwhelming the server.
   * Returns a promise that resolves when all warm-up fetches settle (never rejects).
   */
  async warmUp(subjectIds: number[], fetcher: (id: number) => Promise<GradeSheet>): Promise<void> {
    const pending = subjectIds.filter(id => !this.get(id) && !inFlight.has(id))
    for (let i = 0; i < pending.length; i += WARMUP_CONCURRENCY) {
      const batch = pending.slice(i, i + WARMUP_CONCURRENCY)
      await Promise.allSettled(
        batch.map(id => this.fetchOrGet(id, () => fetcher(id)))
      )
    }
  },
}
