import { Module } from "@nestjs/common"
import { BullRegisterOptions } from "./bull.types"
import { bullData } from "./bull.constants"
import { BullModule as NestBullModule } from "@nestjs/bullmq"
import { envConfig, RedisType } from "@src/env"
import { ChildProcessDockerRedisClusterModule, ChildProcessDockerRedisClusterService } from "@src/child-process"
import { Cluster } from "ioredis"

@Module({})
export class BullModule { 
    // register the queue
    public static registerQueue(options: BullRegisterOptions) {
        return {
            module: BullModule,
            imports: [
                NestBullModule.registerQueue({
                    name: bullData[options.queueName].name
                })
            ],
            providers: [
            ],
            exports: [
                NestBullModule.registerQueue({
                    name: bullData[options.queueName].name
                })
            ]
        }
    }

    // for root
    public static forRoot() {
        return {
            module: BullModule,
            imports: [
                NestBullModule.forRootAsync({
                    imports: [ 
                        ChildProcessDockerRedisClusterModule.forRoot({
                            type: RedisType.Job
                        }) 
                    ],
                    inject: [ ChildProcessDockerRedisClusterService ],
                    useFactory: async (childProcessDockerRedisClusterService :ChildProcessDockerRedisClusterService) => {
                        const natMap = await childProcessDockerRedisClusterService.getNatMap()
                        const connection = new Cluster([
                            {
                                host: envConfig().databases.redis[RedisType.Adapter].host,
                                port: Number(envConfig().databases.redis[RedisType.Adapter].port)
                            }
                        ], {
                            scaleReads: "slave",
                            redisOptions: {
                                password: envConfig().databases.redis[RedisType.Cache].password || undefined,
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