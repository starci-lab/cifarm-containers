export interface CacheOptions {
    /**
     * Type of caching.
     * - "database": Caching values in a database table.
     * - "redis": Caching values in Redis.
     * - "ioredis": Caching values using ioredis.
     * - "ioredis/cluster": Caching values in Redis Cluster.
     */
    type: "database" | "redis" | "ioredis" | "ioredis/cluster"

    /**
     * Redis or database connection options.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    options?: any

    /**
     * Enables caching for all queries globally.
     */
    alwaysEnabled?: boolean

    /**
     * Cache expiration duration in milliseconds.
     */
    duration?: number

    /**
     * Ignore cache-related errors and fallback to database.
     */
    ignoreErrors?: boolean
}