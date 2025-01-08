import { Module } from "@nestjs/common"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./keyv.module-definition"
import { KeyvService } from "./keyv.service"
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
    providers: [KeyvService],
    exports: [KeyvService]
})
export class KeyvModule extends ConfigurableModuleClass {
    public static register(options: typeof OPTIONS_TYPE = {}) {
        return super.register(options)
    }
}