import { envConfig } from "@src/env"
import { CACHE_DURATION, MAX_RETRIES_PER_REQUEST, SHOW_FRIENDLY_ERROR_STACK, SLOTS_REFRESH_TIMEOUT } from "../databases.constants"

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

export const createCacheOptions = (cluster: boolean = false): CacheOptions => {
    if (cluster) {
        return {
            type: "ioredis/cluster" as const,
            options: {
                startupNodes: [
                    {
                        host: envConfig().databases.redis.cache.cluster.node1.host,
                        port: Number(envConfig().databases.redis.cache.cluster.node1.port),
                    },
                    {
                        host: envConfig().databases.redis.cache.cluster.node2.host,
                        port: Number(envConfig().databases.redis.cache.cluster.node2.port),
                    },
                    {
                        host: envConfig().databases.redis.cache.cluster.node3.host,
                        port: Number(envConfig().databases.redis.cache.cluster.node3.port),
                    },
                ],
                scaleReads: "all",
                clusterRetryStrategy: (times: number) => Math.min(times * 50, 2000),
                slotsRefreshTimeout: SLOTS_REFRESH_TIMEOUT,
                redisOptions: {
                    maxRetriesPerRequest: MAX_RETRIES_PER_REQUEST,
                    showFriendlyErrorStack: SHOW_FRIENDLY_ERROR_STACK,
                },
            },
            alwaysEnabled: true,
            // Cache expiry in 1 days
            duration: CACHE_DURATION,
            ignoreErrors: true,
        }
    } 
    
    return {
        type: "redis" as const,
        options: {
            socket: {
                host: envConfig().databases.redis.cache.host,
                port: Number(envConfig().databases.redis.cache.port),
            },
        },
        alwaysEnabled: true,
        // Cache expiry in 1 days
        duration: CACHE_DURATION,
        ignoreErrors: true,
    }
}