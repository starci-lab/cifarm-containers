import { envConfig } from "@src/env"
import { CacheOptions } from "./redis.type"

export const createCacheOptions = (isCluster: boolean = false): CacheOptions => {
    if (isCluster) {
        return {
            type: "ioredis/cluster",
            options: {
                startupNodes: [
                    {
                        host: envConfig().databases.redis.cluster.node1.host,
                        port: Number(envConfig().databases.redis.cluster.node1.port),
                    },
                    {
                        host: envConfig().databases.redis.cluster.node2.host,
                        port: Number(envConfig().databases.redis.cluster.node2.port),
                    },
                    {
                        host: envConfig().databases.redis.cluster.node3.host,
                        port: Number(envConfig().databases.redis.cluster.node3.port),
                    },
                ],
                scaleReads: "all",
                clusterRetryStrategy: (times: number) => Math.min(times * 50, 2000),
                slotsRefreshTimeout: 3000,
                redisOptions: {
                    maxRetriesPerRequest: 3,
                    showFriendlyErrorStack: true,
                },
            },
            alwaysEnabled: true,
            // Cache expiry in 1 days
            duration: 1 * 24 * 60 * 60 * 1000,
            ignoreErrors: true,
        }
    } else {
        return {
            type: "redis",
            options: {
                socket: {
                    host: envConfig().databases.redis.default.host,
                    port: Number(envConfig().databases.redis.default.port),
                },
            },
            alwaysEnabled: true,
            // Cache expiry in 1 days
            duration: 1 * 24 * 60 * 60 * 1000,
            ignoreErrors: true,
        }
    }
}
