import { Module } from "@nestjs/common"
import { ChildProcessDockerRedisClusterOptions } from "./redis-cluster.types"
import { CHILD_PROCESS_DOCKER_REDIS_CLUSTER_OPTIONS } from "./redis-cluster.constants"
import { ChildProcessDockerRedisClusterService } from "./redis-cluster.service"
import { ChildProcessModule } from "../../base"
import { CacheMemoryModule } from "@src/cache"

@Module({})
export class ChildProcessDockerRedisClusterModule {
    public static forRoot(options?: ChildProcessDockerRedisClusterOptions) {
        return {
            module: ChildProcessDockerRedisClusterModule,
            imports: [
                ChildProcessModule,
                CacheMemoryModule.forRoot(),
            ],
            providers: [
                {
                    provide: CHILD_PROCESS_DOCKER_REDIS_CLUSTER_OPTIONS,
                    useValue: options
                },
                ChildProcessDockerRedisClusterService
            ],
            exports: [ChildProcessDockerRedisClusterService]
        }
    }
}
