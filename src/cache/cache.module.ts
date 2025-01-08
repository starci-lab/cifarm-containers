import { DynamicModule, Module } from "@nestjs/common"
import { CACHE_MANAGER } from "./cache.constants"
import { envConfig, RedisType } from "@src/env"
import { ExecDockerRedisClusterService, ExecModule } from "@src/exec"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./cache.module-definition"
import { KeyvManagerService } from "./keyv-manager.service"
import { createCacheManagerFactoryProvider } from "./cache.providers"

@Module({
    imports: [
        ExecModule.register({
            docker: {
                redisCluster: {
                    networkName:
                        envConfig().databases.redis[RedisType.Cache].cluster.dockerNetworkName
                }
            }
        })
    ],
    providers: [
        ExecDockerRedisClusterService,
        KeyvManagerService,
        createCacheManagerFactoryProvider(),
        {
            provide: CACHE_MANAGER,
            useExisting: Cache
        }
    ],
    exports: [CACHE_MANAGER]
})
export class CacheModule extends ConfigurableModuleClass {
    static forRoot(options: typeof OPTIONS_TYPE = {}): DynamicModule {
        return super.forRoot(options)
    }
}
