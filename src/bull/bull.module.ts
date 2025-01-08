import { BullModule as NestBullModule } from "@nestjs/bullmq"
import { envConfig, RedisType } from "@src/env"
import { ChildProcessDockerRedisClusterModule, ChildProcessDockerRedisClusterService } from "@src/child-process"
import { Cluster } from "ioredis"
import { BULL_REGISTER_OPTIONS, bullData } from "./bull.constants"
import { BullService } from "./bull.service"
import { BullRegisterOptions } from "./bull.types"
import { formatWithBraces } from "./bull.utils"

@Module({})
export class BullModule { 
    // register the queue
    public static registerQueue(options: BullRegisterOptions) {
        return {
            module: BullModule,
            imports: [
                NestBullModule.registerQueue({
                    name: bullData[options.queueName].name,
                    prefix: bullData[options.queueName].prefix,
                })
            ],
            providers: [],
            exports: [
                NestBullModule.registerQueue({
                    name: bullData[options.queueName].name,
                    prefix: bullData[options.queueName].prefix,
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
                                host: envConfig().databases.redis[RedisType.Job].host,
                                port: Number(envConfig().databases.redis[RedisType.Job].port)
                            }
                        ], {
                            scaleReads: "master",
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