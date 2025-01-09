import { Module } from "@nestjs/common"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./cache-options.module-definition"
import { CacheOptionsService } from "./cache-options.service"
import { ExecModule } from "@src/exec"
import { RedisType } from "@src/env"

@Module({
    imports: [
        ExecModule.register({
            docker: {
                redisCluster: {
                    type: RedisType.Cache
                }
            }
        })
    ],
    providers: [CacheOptionsService],
    exports: [CacheOptionsService]
})
export class CacheOptionsModule extends ConfigurableModuleClass {
    static register(options: typeof OPTIONS_TYPE = {}) {
        return super.register(options)
    }
}
