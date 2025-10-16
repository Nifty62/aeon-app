interface CacheEntry<T> {
    data: T;
    timestamp: number;
}

const CACHE: Map<string, CacheEntry<any>> = new Map();
const CACHE_DURATION_MS = 1000 * 60 * 30; // 30 minutes

export const cacheService = {
    /**
     * Retrieves an item from the cache if it exists and is not expired.
     */
    get<T>(key: string): T | null {
        const entry = CACHE.get(key);
        if (entry && (Date.now() - entry.timestamp < CACHE_DURATION_MS)) {
            console.log(`[Cache] HIT for key: ${key}`);
            return entry.data as T;
        }
        if (entry) {
            console.log(`[Cache] STALE for key: ${key}`);
            CACHE.delete(key);
        }
        return null;
    },

    /**
     * Adds an item to the cache with the current timestamp.
     */
    set<T>(key: string, data: T): void {
        console.log(`[Cache] SET for key: ${key}`);
        const entry: CacheEntry<T> = { data, timestamp: Date.now() };
        CACHE.set(key, entry);
    },

    /**
     * Creates a consistent cache key from a prefix and a JSON-serializable payload.
     * Uses a simple string hash to keep the key length reasonable.
     */
    createKey(prefix: string, payload: object): string {
        try {
            const jsonString = JSON.stringify(payload);
            // Simple string hash function (djb2) to avoid super long keys
            let hash = 5381;
            for (let i = 0; i < jsonString.length; i++) {
                hash = (hash * 33) ^ jsonString.charCodeAt(i);
            }
            return `${prefix}:${hash >>> 0}`; // Ensure positive integer
        } catch {
            // Fallback for non-serializable objects, though this should be avoided.
            return `${prefix}:${Date.now()}`; 
        }
    }
};