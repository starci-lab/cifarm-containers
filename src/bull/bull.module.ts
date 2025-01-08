import { BullModule as NestBullModule } from "@nestjs/bullmq"
import { envConfig, redisClusterEnabled, redisClusterRunInDocker, RedisType } from "@src/env"
import { ExecDockerRedisClusterService } from "@src/exec"
import Redis, { Cluster, NatMap } from "ioredis"
import { bullData } from "./bull.constants"
import { BullRegisterOptions } from "./bull.types"
import { Module } from "@nestjs/common"
import { ConfigurableModuleClass } from "./bull.module-definition"
import { OPTIONS_TYPE } from "@src/brokers"

@Module({})
export class BullModule extends ConfigurableModuleClass { 
    // register the queue
    public static registerQueue(options: BullRegisterOptions) {
        const dynamicModule = NestBullModule.registerQueue({
            name: bullData[options.queueName].name,
            prefix: bullData[options.queueName].prefix,
        })
        return {
            module: BullModule,
            imports: [
                dynamicModule
            ],
            exports: [
                dynamicModule
            ]
        }
    }

    // for root
    public static forRoot(options: typeof OPTIONS_TYPE = {}) {
        const dynamicModule = super.forRoot(options)
        return {
            ...dynamicModule,
            imports: [
                NestBullModule.forRootAsync({
                    inject: [ ExecDockerRedisClusterService ],
                    useFactory: async (execDockerRedisClusterService: ExecDockerRedisClusterService) => {
                        if (!redisClusterEnabled()) {
                            const connection = new Redis({
                                host: envConfig().databases.redis[RedisType.Job].host,
                                port: Number(envConfig().databases.redis[RedisType.Job].port),
                                password: envConfig().databases.redis[RedisType.Job].password || undefined,
                            })
                            return {
                                connection
                            }
                        }
                        let natMap: NatMap
                        if (redisClusterRunInDocker()) {
                            natMap = execDockerRedisClusterService.getNatMap()
                        }
                        const connection = new Cluster([
                            {
                                host: envConfig().databases.redis[RedisType.Job].host,
                                port: Number(envConfig().databases.redis[RedisType.Job].port)
                            }
                        ], {
                            scaleReads: "all",
                            redisOptions: {
                                password: envConfig().databases.redis[RedisType.Job].password || undefined,
                                enableAutoPipelining: true
                            },
                            natMap
                        })
                        return {
                            connection
                        }
                    }
                })
            ],
            providers: [],
            exports: []
        }
    }
}