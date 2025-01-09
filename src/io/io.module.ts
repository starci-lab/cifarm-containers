import { Module } from "@nestjs/common"
import { RedisIoAdapter } from "./redis.adapter"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./io.module-definition"
import { ExecModule } from "@src/exec"
import { RedisType } from "@src/env"

@Module({
    imports: [
        ExecModule.register({
            docker: {
                redisCluster: {
                    type: RedisType.Adapter
                }
            }
        })
    ],
    providers: [RedisIoAdapter],
    exports: [RedisIoAdapter]
})
export class IoModule extends ConfigurableModuleClass {
    static register(options: typeof OPTIONS_TYPE = {}) {
        return super.register(options)
    }
}
