import { Module } from "@nestjs/common"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./exec.module-definition"
import { ExecDockerRedisClusterService } from "./exec-docker-redis-cluster.service"
import { ExecService } from "./exec.service"

@Module({})
export class ExecModule extends ConfigurableModuleClass {
    static register(options: typeof OPTIONS_TYPE = {}) {
        const providers = []
        providers.push(ExecService)

        const exports = []
        if (options?.docker?.redisCluster) {
            providers.push(ExecDockerRedisClusterService)
            exports.push(ExecDockerRedisClusterService)
        }
        
        const dynamicModule = super.register(options)
        return {
            ...dynamicModule,
            providers: [...dynamicModule.providers, ...providers],
            exports: [...exports]
        }
    }
}
