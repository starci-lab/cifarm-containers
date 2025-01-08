import { Module } from "@nestjs/common"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./postgresql-options.module-definition"
import { PostgreSQLOptions } from "./postgresql.options"
import { CacheOptionsService } from "../cache-options.service"
import { ExecModule } from "@src/exec"
import { RedisType } from "@src/env"

@Module({
    imports: [
        ExecModule.register({
            docker: {
                redisCluster: {
                    type: RedisType.Cache,
                }
            }
        }),
    ],
    providers: [
        CacheOptionsService,
        PostgreSQLOptions
    ],
    exports: [
        PostgreSQLOptions
    ]
})
export class PostgreSQLOptionsModule extends ConfigurableModuleClass {
    static forRoot(options: typeof OPTIONS_TYPE = {}) {
        return super.forRoot(options)
    }
}
