import { CacheModule, CacheStore } from "@nestjs/cache-manager"
import { DynamicModule } from "@nestjs/common"
import { envConfig } from "@src/config"
import { redisStore } from "cache-manager-redis-yet"

export const cacheRegisterAsync = () : DynamicModule => {
    return CacheModule.registerAsync({
        isGlobal: true,
        useFactory: async () => {
            const store = await redisStore({
                socket: {
                    host: envConfig().database.redis.cache.host,
                    port: envConfig().database.redis.cache.port
                }
            })

            return {
                store: store as unknown as CacheStore,
                ttl: 3 * 60000 // 3 minutes (milliseconds)
            }
        }
    })
}