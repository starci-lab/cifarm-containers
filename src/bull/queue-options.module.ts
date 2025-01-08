import { Module } from "@nestjs/common"
import { RedisType } from "@src/env"
import { ExecModule } from "@src/exec"
import { QueueOptionsFactory } from "./queue-options.factory"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./queue-options.module-definition"

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
    static forRoot(options: typeof OPTIONS_TYPE = {}) {
        return super.forRoot(options)
    }
}
