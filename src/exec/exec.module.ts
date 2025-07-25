import { DynamicModule, Module, Provider } from "@nestjs/common"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./exec.module-definition"
import { ExecDockerRedisClusterService } from "./exec-docker-redis-cluster.service"
import { ExecService } from "./exec.service"
import { ExecDockerCoreService } from "./exec-docker-core.service"

@Module({})
export class ExecModule extends ConfigurableModuleClass {
    static register(options: typeof OPTIONS_TYPE = {}): DynamicModule {
        // define the providers and exports
        const originServices = [ExecService]
        const providers: Array<Provider> = [...originServices]
        const exports: Array<Provider> = [...originServices]

        // if the redisCluster is enabled and running in docker
        const docker = options?.docker

        // add docker core providers
        if (docker?.core) {
            providers.push(ExecDockerCoreService)
            exports.push(ExecDockerCoreService)
        }

        // add docker redis cluster providers
        // default to true if not provided
        const redisClusterEnabled = docker?.redisCluster && (docker.redisCluster.enabled ?? true)
        if (redisClusterEnabled) {
            const redisCluster = docker?.redisCluster
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
        }

        const dynamicModule = super.register(options)
        return {
            global: options.isGlobal,
            ...dynamicModule,
            providers: [...dynamicModule.providers, ...providers],
            exports
        }
    }
}
