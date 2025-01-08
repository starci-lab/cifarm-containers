import { DynamicModule, Module } from "@nestjs/common"
import { TerminusModule } from "@nestjs/terminus"
import { envConfig, EnvModule, RedisType } from "@src/env"
import { HealthCheckController } from "./health-check.controller"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./health-check.module-definition"
import { HealthCheckDependency } from "./health-check.types"
import { PostgreSQLModule } from "@src/databases"
import { ExecModule } from "@src/exec"

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
        if (options.dependencies.includes(HealthCheckDependency.AdapterRedis)) {
            ExecModule.register({
                docker: {
                    redisCluster: {
                        networkName:
                            envConfig().databases.redis[RedisType.Cache].cluster.dockerNetworkName
                    }
                }
            })
        }
        const dynamicModule = super.forRoot(options)
        return {
            ...dynamicModule,
            imports: [...dynamicModule.imports, ...imports],
            controllers: [HealthCheckController]
        }
    }
}
