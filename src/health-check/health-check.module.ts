import { DynamicModule, Module } from "@nestjs/common"
import { TerminusModule } from "@nestjs/terminus"
import { ChildProcessDockerRedisClusterModule } from "@src/exec"
import { GameplayPostgreSQLModule } from "@src/databases"
import { EnvModule, RedisType } from "@src/env"
import { HEALTH_CHECK_OPTIONS } from "./health-check.constants"
import { HealthCheckController } from "./health-check.controller"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./health-check.module-definition"
import { HealthCheckDependency } from "./health-check.types"

@Module({})
export class HealthCheckModule extends ConfigurableModuleClass {
    public static forRoot(options: typeof OPTIONS_TYPE) : DynamicModule {
        const imports: Array<typeof TerminusModule | DynamicModule> = [
            TerminusModule,
            EnvModule.forRoot()
        ]
        // if gameplay postgresql is used
        if (options.dependencies.includes(HealthCheckDependency.GameplayPostgreSQL)) {
            imports.push(GameplayPostgreSQLModule.forRoot())
        }
        // if adapter redis is used
        if (
            options.dependencies.includes(HealthCheckDependency.AdapterRedis)
        ) {
            imports.push(ChildProcessDockerRedisClusterModule.forRoot({
                type: RedisType.Adapter
            }))
        }
        // if cache redis is used
        if (
            options.dependencies.includes(HealthCheckDependency.CacheRedis)
        ) {
            imports.push(ChildProcessDockerRedisClusterModule.forRoot({
                type: RedisType.Cache
            }))
        }
        // if job redis is used
        if (
            options.dependencies.includes(HealthCheckDependency.JobRedis)
        ) {
            imports.push(ChildProcessDockerRedisClusterModule.forRoot({
                type: RedisType.Job
            }))
        }

        return {
            ...super.forRoot(options),
            module: HealthCheckModule,
            imports,
            providers: [{ provide: HEALTH_CHECK_OPTIONS, useValue: options }],
            controllers: [HealthCheckController]
        }
    }
}
