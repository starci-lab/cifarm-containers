import { Module } from "@nestjs/common"
import { DebugRedisClusterService } from "./redis-cluster.service"
import { DebugRedisClusterOptions } from "./redis-cluster.types"
import { DEBUG_REDIS_CLUSTER_OPTIONS } from "./redis-cluster.constants"
import { ChildProcessDockerRedisClusterModule } from "@src/child-process"
import { RedisType } from "@src/env"

@Module({})
export class DebugRedisClusterModule {
    public static forRoot(options?: DebugRedisClusterOptions) {
        return {
            module: DebugRedisClusterModule,
            imports: [
                ChildProcessDockerRedisClusterModule.forRoot({
                    type: RedisType.Cache
                }),
            ],
            providers: [
                DebugRedisClusterService,
                { provide: DEBUG_REDIS_CLUSTER_OPTIONS, useValue: options }
            ],
            exports: [DebugRedisClusterService]
        }
    }
}
