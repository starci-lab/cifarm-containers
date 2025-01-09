import { Module } from "@nestjs/common"
import { RedisType } from "@src/env"
import { ExecModule } from "@src/exec"
import { QueueOptionsFactory } from "./options.factory"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./options.module-definition"

@Module({
    imports: [
        ExecModule.register({
            docker: {
                redisCluster: {
                    type: RedisType.Job
                }
            }
        })
    ],
    providers: [QueueOptionsFactory],
    exports: [QueueOptionsFactory]
})
export class QueueOptionsModule extends ConfigurableModuleClass {
    static register(options: typeof OPTIONS_TYPE = {}) {
        return super.register(options)
    }
}
