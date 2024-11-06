import { CacheModule, CacheStore } from "@nestjs/cache-manager"
import { redisStore } from "cache-manager-redis-yet"

export const cacheRedisModule = CacheModule.registerAsync({
    useFactory: async () => {
        const store = await redisStore({
            socket: {
                host: "localhost",
                port: 6379,
            },
        })

        return {
            store: store as unknown as CacheStore,
            ttl: 3 * 60000, // 3 minutes (milliseconds)
        }
    },
})