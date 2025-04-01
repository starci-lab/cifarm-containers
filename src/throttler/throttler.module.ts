import { DynamicModule, Module } from "@nestjs/common"
import { ThrottlerModule as NestThrottlerModule, ThrottlerOptions } from "@nestjs/throttler"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./throttler.module-definition"
import { NestExport, NestImport } from "@src/common"
import { getIoRedisToken, IoRedisClientOrCluster, IoRedisModule } from "@src/native"
import { RedisType } from "@src/env"
import { ThrottlerStorageRedisService } from "@nest-lab/throttler-storage-redis"
import { Redis } from "ioredis"
import { ThrottlerStorageType } from "./types"

@Module({})
export class ThrottlerModule extends ConfigurableModuleClass {
    public static forRoot(options: typeof OPTIONS_TYPE = {}): DynamicModule {
        const dynamicModule = super.forRoot(options)
        const exports: Array<NestExport> = []
        const imports: Array<NestImport> = []
        const throttlers = options.overrideThrottlers ?? baseThrottlers
        let module: DynamicModule
        // default storage type is redis
        const storageType = options.storageType ?? ThrottlerStorageType.Redis
        switch (storageType) {      
        case ThrottlerStorageType.Redis: {
            module = NestThrottlerModule.forRootAsync({
                imports: [
                    IoRedisModule.register({
                        type: RedisType.Cache,
                    })
                ],
                inject: [getIoRedisToken(RedisType.Cache)],
                useFactory: (redisClientOrCluster: IoRedisClientOrCluster) => ({
                    errorMessage: "Too many requests",
                    storage: new ThrottlerStorageRedisService(redisClientOrCluster as Redis),
                    throttlers
                })
            })
            break
        }
        case ThrottlerStorageType.Memory: {
            module = NestThrottlerModule.forRoot({      
                errorMessage: "Too many requests",
                throttlers
            })
            break
        }
        }
        imports.push(module)
        exports.push(module)
        return {
            ...dynamicModule,
            imports,
            exports
        }
    }
}

const baseThrottlers: Array<ThrottlerOptions> = [
    {
        // 60 requests per minute
        name: "per se",
        ttl: 60000,
        limit: 60
    },
    {
        // 300 requests per 10 minutes, 30 requests per minute
        name: "per 5 minutes",  
        ttl: 300000,
        limit: 150
    },
    {
        // 1000 requests per 1 hours, 16 requests per minute
        name: "per 10 minutes",
        ttl: 600000,
        limit: 1000
    },
]
