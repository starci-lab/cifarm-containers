import { Module } from "@nestjs/common"
import { DebugRedisClusterService } from "./redis-cluster.service"
import { ExecModule } from "@src/exec"
import { OPTIONS_TYPE, ConfigurableModuleClass } from "./redis-cluster.module-definition"
import { RedisType } from "@src/env"

@Module({})
export class DebugRedisClusterModule extends ConfigurableModuleClass {
    public static register(options: typeof OPTIONS_TYPE = {}) {
        const type = options.type ?? RedisType.Cache
        const dynamicModule = super.register(options)
        return {
            ...dynamicModule,
            imports: [
                ExecModule.register({
                    docker: {
                        redisCluster: {
                            type,
                        }
                    }
                }),
            ],
            providers: [
                ...dynamicModule.providers,
                DebugRedisClusterService
            ],
        }
    }
}
