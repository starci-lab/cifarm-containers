import { DynamicModule, Module } from "@nestjs/common"
import { TerminusModule } from "@nestjs/terminus"
import { EnvModule, redisClusterEnabled, redisClusterRunInDocker, RedisType } from "@src/env"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./health-check.module-definition"
import { HealthCheckDependency } from "./health-check.types"
import { PostgreSQLModule } from "@src/databases"
import { ExecModule } from "@src/exec"
import {
    ADAPTER_REDIS_INJECTION_TOKEN,
    CACHE_REDIS_INJECTION_TOKEN,
    JOB_REDIS_INJECTION_TOKEN
} from "./health-check.constants"
import { HealthCheckController } from "./health-check.controller"

@Module({})
export class HealthCheckModule extends ConfigurableModuleClass {
    public static forRoot(options: typeof OPTIONS_TYPE): DynamicModule {
        const imports: Array<typeof TerminusModule | DynamicModule> = [
            TerminusModule,
            EnvModule.forRoot()
        ]
        // if gameplay postgresql is used
        if (options.dependencies.includes(HealthCheckDependency.GameplayPostgreSQL)) {
            imports.push(PostgreSQLModule.forRoot())
        }
        // if adapter redis is used
        if (
            options.dependencies.includes(HealthCheckDependency.AdapterRedis) &&
            redisClusterEnabled(RedisType.Adapter) &&
            redisClusterRunInDocker(RedisType.Adapter)
        ) {
            imports.push(
                ExecModule.register({
                    docker: {
                        redisCluster: {
                            type: RedisType.Adapter,
                            injectionToken: ADAPTER_REDIS_INJECTION_TOKEN
                        }
                    }
                })
            )
        }
        // if cache redis is used
        if (
            options.dependencies.includes(HealthCheckDependency.CacheRedis) &&
            redisClusterEnabled(RedisType.Cache) &&
            redisClusterRunInDocker(RedisType.Cache)
        ) {
            imports.push(
                ExecModule.register({
                    docker: {
                        redisCluster: {
                            type: RedisType.Cache,
                            injectionToken: CACHE_REDIS_INJECTION_TOKEN
                        }
                    }
                })
            )
        }
        // if job redis is used
        if (
            options.dependencies.includes(HealthCheckDependency.JobRedis) &&
            redisClusterEnabled(RedisType.Job) &&
            redisClusterRunInDocker(RedisType.Job)
        ) {
            imports.push(
                ExecModule.register({
                    docker: {
                        redisCluster: {
                            type: RedisType.Job,
                            injectionToken: JOB_REDIS_INJECTION_TOKEN
                        }
                    }
                })
            )
        }
        const dynamicModule = super.forRoot(options)
        return {
            ...dynamicModule,
            imports,
            controllers: [HealthCheckController]
        }
    }
}
