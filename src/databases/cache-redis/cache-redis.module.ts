import { CacheModule, CacheStore } from "@nestjs/cache-manager"
import { Module } from "@nestjs/common"
import { redisStore } from "cache-manager-redis-yet"
import { CacheRedisService } from "./cache-redis.service"
import { envConfig } from "@src/env"

@Module({})
export class CacheRedisModule {
    public static forRoot() {
        return {
            module: CacheRedisModule,
            imports: [
                CacheModule.registerAsync({
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
            ],
            providers: [CacheRedisService],
            exports: [CacheRedisService]
        }
    }
}