/**
 * API Cache Utility
 *
 * Two-layer cache to avoid 429 rate-limit errors:
 * 1. In-memory dedup — same request already in flight? Reuse the promise.
 * 2. localStorage cache — serve cached response with TTL when backend returns 429.
 */

const CACHE_PREFIX = "sentinelr_cache_";
const DEFAULT_TTL_MS = 30_000; // 30 seconds
const STALE_TTL_MS = 120_000; // 2 minutes — use stale cache when 429

// In-memory store for deduplicating in-flight requests
const inFlight = new Map();

function buildKey(endpoint, options = {}) {
  const body = options.body ? `|${options.body}` : "";
  return `${options.method || "GET"}:${endpoint}${body}`;
}

function getCache(key) {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const entry = JSON.parse(raw);
    if (Date.now() - entry.timestamp > STALE_TTL_MS) {
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }
    return entry;
  } catch {
    return null;
  }
}

function setCache(key, data) {
  try {
    localStorage.setItem(
      CACHE_PREFIX + key,
      JSON.stringify({ data, timestamp: Date.now() })
    );
  } catch {
    // localStorage full — clear old entries
    clearExpiredCache();
  }
}

function clearExpiredCache() {
  try {
    const now = Date.now();
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(CACHE_PREFIX)) {
        try {
          const entry = JSON.parse(localStorage.getItem(key));
          if (now - entry.timestamp > STALE_TTL_MS) {
            keysToRemove.push(key);
          }
        } catch { /* skip corrupt entries */ }
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch { /* ignore */ }
}

/**
 * Wraps a fetch call with caching and deduplication.
 *
 * @param {string} endpoint - API endpoint path
 * @param {object} options  - fetch options (method, body, headers, etc.)
 * @param {function} fetchFn - the actual fetch function to call
 * @returns {Promise<any>}
 */
export async function cachedFetch(endpoint, options, fetchFn) {
  const key = buildKey(endpoint, options);

  // 1. Dedup: if same request is already in flight, return the existing promise
  if (inFlight.has(key)) {
    return inFlight.get(key);
  }

  const promise = (async () => {
    try {
      const data = await fetchFn();
      // Cache successful response
      setCache(key, data);
      return data;
    } catch (err) {
      // On failure (including 429 after retries), try cache
      const cached = getCache(key);
      if (cached) {
        console.warn(`[apiCache] Serving stale cache for ${endpoint} (${Math.round((Date.now() - cached.timestamp) / 1000)}s old)`);
        return cached.data;
      }
      throw err;
    } finally {
      inFlight.delete(key);
    }
  })();

  inFlight.set(key, promise);
  return promise;
}
