import { DynamicModule, Module, Provider } from "@nestjs/common"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./exec.module-definition"
import { ExecDockerRedisClusterService } from "./exec-docker-redis-cluster.service"
import { ExecService } from "./exec.service"

@Module({})
export class ExecModule extends ConfigurableModuleClass {
    static register(options: typeof OPTIONS_TYPE = {}): DynamicModule {
        // define the providers and exports
        const providers: Array<Provider> = [ExecService]
        const exports: Array<Provider> = []

        // if the redisCluster is enabled and running in docker
        const redisCluster = options?.docker?.redisCluster
        if (redisCluster) {
            providers.push(ExecDockerRedisClusterService)
            exports.push(ExecDockerRedisClusterService)
            // if an injectionToken is provided, add it to the providers
            if (redisCluster.injectionToken) {
                const provider: Provider = {
                    provide: redisCluster.injectionToken,
                    useExisting: ExecDockerRedisClusterService
                }
                providers.push(provider)
                exports.push(provider)
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
