import { DynamicModule, Module, Provider } from "@nestjs/common"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./exec.module-definition"
import { ExecDockerRedisClusterService } from "./exec-docker-redis-cluster.service"
import { ExecService } from "./exec.service"

@Module({})
export class ExecModule extends ConfigurableModuleClass {
    static register(options: typeof OPTIONS_TYPE = {}): DynamicModule {
        const providers: Array<Provider> = []
        const exports: Array<Provider> = []

        // add the ExecService to the providers
        providers.push(ExecService)

        // if the redisCluster is enabled and running in docker
        const redisCluster = options?.docker?.redisCluster
        if (redisCluster) {
            providers.push(ExecDockerRedisClusterService)
            exports.push(ExecDockerRedisClusterService)
            // if an injectionToken is provided, add it to the providers
            if (redisCluster.injectionToken) {
                providers.push({
                    provide: redisCluster.injectionToken,
                    useExisting: ExecDockerRedisClusterService
                })
            }
        }

        const dynamicModule = super.register(options)
        return {
            ...dynamicModule,
            providers: [...dynamicModule.providers, ...providers],
            exports
        }
    }
}
