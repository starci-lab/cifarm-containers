import { DynamicModule, Module } from "@nestjs/common"
import { ThrottlerModule as NestThrottlerModule, ThrottlerOptions } from "@nestjs/throttler"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./throttler.module-definition"
import { NestExport, NestImport } from "@src/common"
import { getIoRedisToken, IoRedisClientOrCluster, IoRedisModule } from "@src/native"
import { RedisType } from "@src/env"
import { ThrottlerStorageRedisService } from "@nest-lab/throttler-storage-redis"
import { Redis } from "ioredis"
import { ThrottlerStorageType } from "./types"
// enum for throttler config name
export enum ThrottlerName {
    // default throttler config
    Tiny = "tiny",
    Small = "small",
    Medium = "medium",
    Large = "large"
}
@Module({})
export class ThrottlerModule extends ConfigurableModuleClass {
    public static forRoot(options: typeof OPTIONS_TYPE = {}): DynamicModule {
        const dynamicModule = super.forRoot(options)
        const exports: Array<NestExport> = []
        const imports: Array<NestImport> = []
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

const throttlers: Array<ThrottlerOptions> = [
    {
        // 2 requests per minute
        name: ThrottlerName.Tiny,
        ttl: 60000,
        limit: 5
    },
    {
        // 10 requests per minute
        name: ThrottlerName.Small,
        ttl: 60000,
        limit: 10
    },
    {
        // 20 requests per minute
        name: ThrottlerName.Medium,
        ttl: 60000,
        limit: 20
    },
    {
        // 60 requests per minute
        name: ThrottlerName.Large,
        ttl: 60000,
        limit: 60
    }
]
